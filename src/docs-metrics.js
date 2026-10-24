// Definitions follow sec/4_RoboValueBenchmark.tex in the RoboValue manuscript.
const tex = String.raw;
const tgaFormulas = [
  { tex: tex`\Delta_e(l')=\operatorname{mean}_{(A_0,A_T)}c(A_0,A_T;l')`, description: 'Mean predicted gain for episode e under instruction l′.' },
  { tex: tex`\mathrm{TGA}=\frac{1}{|\mathcal E^+|}\sum_{e\in\mathcal E^+}\mathbf 1\!\left[\Delta_e(l)>\max_{l'\in\mathcal N}\Delta_e(l')\right]`, description: 'The correct instruction must yield a greater gain than every negative instruction.' },
];

// Names and assignments follow Appendix A, tab:metric-trajectory-design.
export const trajectoryTypes = {
  expert: { label: 'Expert Demonstrations', href: '/doc/get-started/data/overview/#dataset-test' },
  error_continuation: { label: 'Error Continuation', href: '/doc/diagnostic-trajectories/failure-and-recovery/#trajectory-pattern' },
  effective_recovery: { label: 'Effective Recovery', href: '/doc/diagnostic-trajectories/failure-and-recovery/#trajectory-pattern' },
  ineffective_recovery: { label: 'Ineffective Recovery', href: '/doc/diagnostic-trajectories/failure-and-recovery/#trajectory-pattern' },
  long_horizon: { label: 'Long-Horizon Temporal Trajectories', href: '/doc/diagnostic-trajectories/long-horizon/' },
  multi_solution: { label: 'Multi-Solution Trajectories', href: '/doc/diagnostic-trajectories/multi-solution/' },
};

export const dimensionDocumentation = {
  understanding: {
    purpose: 'Relate observed behavior to the intended goal and the subtasks required to achieve it.',
    relationship: 'SA tests overall goal satisfaction. TGA-CT and TGA-CF test whether those judgments are grounded in the instruction, at the task and requirement levels. SIA tests recognition of the active subtask. Together, they distinguish knowing that an execution succeeds from understanding what it achieves and which step is underway.',
  },
  tracking: {
    purpose: 'Track how task progress changes throughout an execution, including regression and progress that depends on history.',
    relationship: 'VOC tests the ordering of intermediate states during successful execution. Cycle-VOC reverses the recorded state sequence to separate task progress from elapsed-time cues. Memory-VOC uses recurring visual states to examine accumulated progress. The three tests expose different sources of error in temporal feedback.',
  },
  diagnosis: {
    purpose: 'Recognize when execution goes wrong and distinguish corrective activity from a resolved error.',
    relationship: 'FPL tests when a model responds to an error. TRR tests how its values evolve during the error, a recovery attempt, and the eventual outcome. A model can react to a failure without localizing its onset accurately, or reward corrective motion without recognizing that the correction failed.',
  },
  consistency: {
    purpose: 'Provide stable, informative local feedback and assign comparable credit to semantic subtasks across valid executions.',
    relationship: 'VS examines the value curve within an execution. CSVC compares subtask gains across different valid execution orders. These tests address the reliability of local feedback used for rewards, segment selection, and data weighting; their scores are interpreted alongside the progress and task-understanding metrics.',
  },
};

export const metricDocumentation = {
  sa: {
    name: 'Success Accuracy', input: 'Scalar values', range: '[0, 1]',
    trajectories: ['expert', 'error_continuation', 'effective_recovery', 'ineffective_recovery'],
    purpose: 'Tests whether terminal values distinguish complete goal satisfaction from partial or failed execution. This capability supports selecting successful demonstrations and deriving outcome-based rewards.',
    cohort: 'Expert executions and effective recoveries provide successful outcomes; error continuations and ineffective recoveries provide unsuccessful outcomes. Successful and unsuccessful episodes are paired within the same task and evaluation setting.',
    preparation: ['For each episode e, average predictions over the final 2% of its duration to obtain the terminal score zₑ. Let ℰ⁺ and ℰ⁻ denote the successful and unsuccessful episodes.'],
    formulas: [{ tex: tex`\mathrm{SA}=\frac{\sum_{e\in\mathcal E^+}\sum_{e'\in\mathcal E^-}\mathbf 1[z_e>z_{e'}]}{|\mathcal E^+|\,|\mathcal E^-|}`, description: 'Fraction of successful–unsuccessful pairs ranked correctly.' }],
    details: ['A pair receives credit only if the successful episode has a strictly higher terminal score; ties receive zero. No shared absolute success threshold is required.'],
    interpretation: 'A high SA indicates reliable outcome discrimination. It does not establish that intermediate values track progress or that the model grounds its judgments in the instruction.',
  },
  tga_ct: {
    name: 'Task Grounding Accuracy — Cross-Task', input: 'Pairwise comparisons', range: '[0, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether value judgments depend on the language-specified goal. Reliable cross-task grounding enables one evaluator to provide relevant feedback across tasks and helps retrieve demonstrations for a requested goal.',
    cohort: 'Each successful demonstration is evaluated under its correct instruction and instructions from other tasks. The visual execution remains fixed across these queries.',
    preparation: ['Sample state pairs from the first and last 2% of each successful episode and average their signed comparisons under each instruction. Here l is the correct instruction, ℕ contains instructions from other tasks, and ℰ⁺ contains the evaluated successful episodes.'],
    formulas: tgaFormulas,
    details: ['Scoring uses a strict top-1 comparison: a tie with any negative instruction receives zero. The same trajectory and query pairs are used for every instruction.'],
    interpretation: 'A high TGA-CT means the model discriminates between distinct task goals. TGA-CF tests finer changes within an otherwise similar instruction.',
  },
  tga_cf: {
    name: 'Task Grounding Accuracy — Counterfactual', input: 'Pairwise comparisons', range: '[0, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether value judgments reflect the specific object, action, placement, and constraint requirements of an instruction. This guards against rewarding behavior that resembles the requested task but fulfills a different goal.',
    cohort: 'Each successful demonstration is evaluated under its correct instruction and four counterfactual variants. Each variant changes a task requirement while the visual execution remains fixed.',
    preparation: ['Use the same start–end sampling and strict top-1 gain comparison as TGA-CT. Here ℕ contains the counterfactual instructions, l is the original instruction, and ℰ⁺ contains the evaluated successful episodes.'],
    formulas: tgaFormulas,
    details: ['The correct instruction must yield a greater mean gain than every counterfactual; ties receive zero. The four change types are objects, actions, placement, and constraints.'],
    interpretation: 'A model may distinguish unrelated tasks yet overlook a changed object or ordering constraint. TGA-CF isolates this finer instruction sensitivity.',
  },
  sia: {
    name: 'Subtask Identification Accuracy', input: 'Subtask descriptions', range: '[0, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether a model recognizes the active semantic subtask. This connects observed behavior to the current intermediate objective, supporting stage-specific feedback and contextual failure diagnosis.',
    cohort: 'Annotated subtask intervals identify the active subtask in each successful demonstration. Queries are sampled inside each interval, away from its boundaries.',
    preparation: ['The model generates a free-form subtask description without seeing the candidate labels. A separate DeepSeek-V4-Pro judge compares it with the task’s candidate subtasks and assigns probability qᵢ to the ground-truth subtask for query i.'],
    formulas: [{ tex: tex`\mathrm{SIA}=\exp\!\left(\frac{1}{N}\sum_{i=1}^{N}\log q_i\right)`, description: 'Geometric mean of the ground-truth subtask probabilities over N queries.' }],
    details: ['Compute the geometric mean within each task, then apply the shared task and domain aggregation. SIA is reported separately and does not contribute to the current overall leaderboard score.'],
    interpretation: 'SIA measures semantic agreement with the active subtask through a probabilistic judge. It is not hard-label classification accuracy; a low probability on a query lowers the geometric mean more strongly than an arithmetic average would.',
  },
  voc: {
    name: 'Value-Order Correlation', input: 'Scalar value sequences', range: '[−1, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether intermediate values preserve the progress order of a successful execution. Correct ordering supports dense reward construction and temporal credit assignment without requiring a calibrated completion percentage.',
    cohort: 'The forward portion of each successful demonstration supplies the progress reference, using the shared forward–reverse evaluation. Failure branches and alternative-solution episodes are excluded from this cohort.',
    preparation: ['For N predictions vᵢ sampled at timestamps tᵢ in a successful trajectory of duration T, compute Spearman rank correlation ρₛ with normalized time. Temporal order serves as a proxy for progress.'],
    formulas: [{ tex: tex`\mathrm{VOC}=\rho_{\mathrm S}\!\left((v_i)_{i=1}^{N},(t_i/T)_{i=1}^{N}\right)`, description: 'Rank correlation between predicted value and forward progress order.' }],
    details: ['Constant predictions receive zero. Rank correlation permits nonlinear value scales and changes in execution speed.'],
    interpretation: 'A high VOC indicates correctly ordered forward predictions. A model that simply increases its score with elapsed time can also score highly, so Cycle-VOC examines its response to reversed progress.',
  },
  cycle_voc: {
    name: 'Cycle-VOC', input: 'Scalar value sequences', range: '[−1, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether predicted progress responds to changes in task state when elapsed time continues to increase. Reversing the recorded sequence exposes temporal shortcuts that successful forward execution alone cannot reveal.',
    cohort: 'Each successful demonstration is replayed forward and then backward as one continuous sequence, with a single shared turning point.',
    preparation: ['For models that use history, the reverse half retains the preceding forward context. Let ρfwd be Spearman correlation with increasing progress order and ρrev correlation with decreasing progress order in the reverse half. Both scored halves include the turning point.'],
    formulas: [{ tex: tex`\mathrm{Cycle\text{-}VOC}=\frac{\rho_{\mathrm{fwd}}+\rho_{\mathrm{rev}}}{2}`, description: 'Mean agreement with forward and reverse progress orders.' }],
    details: ['A constant prediction sequence receives zero for that half. The two halves are evaluated without resetting the model’s history. VROC, used in the leaderboard aggregation, denotes the reverse-half correlation ρrev.'],
    interpretation: 'Reverse playback is a controlled visual diagnostic and need not describe a physically executable action sequence. The score tests agreement with the recorded progress order, rather than requiring every individual value change to be strictly monotonic.',
  },
  memory_voc: {
    name: 'Memory-VOC', input: 'Scalar value sequences', range: '[−1, 1]',
    trajectories: ['long_horizon'],
    purpose: 'Tests progress estimation when the current image is ambiguous because a similar state has appeared before. Tracking completed repetitions or subtasks is useful for long-horizon reward assignment and execution monitoring.',
    cohort: 'Repeated actions and recurring visual states produce similar observations after different amounts of completed work. These trajectories make progress ambiguous without the relevant execution history.',
    preparation: ['Apply the VOC scoring rule to these successful, history-dependent trajectories. Predictions vᵢ use the temporal context available through each model’s interface; tᵢ is the sampled timestamp and T the trajectory duration.'],
    formulas: [{ tex: tex`\mathrm{Memory\text{-}VOC}=\rho_{\mathrm S}\!\left((v_i)_{i=1}^{N},(t_i/T)_{i=1}^{N}\right)`, description: 'Progress-order correlation on trajectories with recurring visual states.' }],
    details: ['Constant predictions receive zero. The scoring rule matches VOC; the diagnostic trajectory design changes.'],
    interpretation: 'A high score is compatible with accurate history-dependent progress estimation, but elapsed time remains correlated with progress. The result should therefore be considered alongside the forward–reverse diagnostic.',
  },
  fpl: {
    name: 'Failure-Point Localization', input: 'Scalar value sequences', range: '[0, 1]', lower: true,
    trajectories: ['error_continuation', 'effective_recovery'],
    purpose: 'Tests whether a model’s strongest value decline locates the onset of an execution error. Accurate localization helps retain useful stages of partially successful trajectories and direct negative feedback toward the actual failure.',
    cohort: 'Error Continuation and Effective Recovery trajectories each contain a single annotated execution error, so the target failure onset is unambiguous.',
    preparation: ['Sample values at 5 Hz, including the final frame. A ZigZag filter suppresses small reversals using a threshold of 0.2 times the largest earlier-to-later value drop. The peak preceding the largest retained decline defines the predicted onset t̂.', 'Let tᴳᵀ be the annotated onset and T the final-frame timestamp. If no decline is detected, assign the maximum possible temporal error within that trajectory.'],
    formulas: [{ tex: tex`\mathrm{FPL}=\frac{1}{T}\begin{cases}|\hat t-t^{\mathrm{GT}}|,&\text{decline detected},\\[4pt]\max(t^{\mathrm{GT}},T-t^{\mathrm{GT}}),&\text{otherwise}.\end{cases}`, description: 'Failure-onset localization error normalized by trajectory duration.' }],
    details: ['For equal declines, select the shortest interval, then the earliest start. Flat peaks use their last point and flat troughs their first; unfinished terminal declines are retained.'],
    interpretation: 'Lower is better. A delayed response or a larger decline during unrelated activity produces localization error even if the model reacts to the failure somewhere in the sequence.',
  },
  trr: {
    name: 'Trajectory Recovery Reasoning', input: 'Scalar value sequences', range: '[0, 1]',
    trajectories: ['error_continuation', 'effective_recovery', 'ineffective_recovery'],
    purpose: 'Tests whether value trends distinguish an initial error, corrective progress, and the eventual recovery outcome. This supports recovery-policy feedback and monitoring without equating a correction attempt with success.',
    cohort: 'Matched trajectories share an initial failure scenario and then diverge into the three branches. Their annotated stages distinguish the initial error, continued error, recovery attempts, and recovery outcomes. Published results cover the standard setting.',
    preparation: ['Evaluate each branch on its own trajectory. Annotated stages are initial failure (f), continued error (c), recovery attempt (r), and outcome (o). Within a stage s, vᵢ is the predicted value and wᵢ is the duration represented by sample i.'],
    formulas: [
      { tex: tex`D_s=\frac{\sum_{i<j}w_iw_j(v_j-v_i)}{\sum_{i<j}w_iw_j|v_j-v_i|}`, description: 'Time-weighted direction of value change over all ordered pairs in a stage.' },
      { tex: tex`\mathrm{TRR}=\mathbf 1[D_f<0]\begin{cases}\mathbf 1[D_c\leq0],&\mathrm{CE},\\[3pt]\mathbf 1[D_r>0\land D_o>0],&\mathrm{SR},\\[3pt]\mathbf 1[D_r>0\land D_o<0],&\mathrm{FR}.\end{cases}`, description: 'A branch receives credit only when every required stage trend is satisfied.' },
    ],
    details: ['CE, SR, and FR denote continued error, successful recovery, and failed recovery: the three corresponding trajectory branches. Values must decline during failure, remain non-increasing during continued error, and increase during a recovery attempt. The outcome must then increase for successful recovery and decline for failed recovery.', 'Stages use a 10 Hz base grid, supplemented with native frames to reach 10 samples when available; no interpolation is applied. A zero denominator gives Dₛ = 0. The failed-outcome stage ends before the next subtask begins. Average branch scores within each matched group, then groups within each task and setting.'],
    interpretation: 'A high TRR indicates appropriate responses across the full failure–recovery sequence. FPL separately measures the precision with which the initial error is localized.',
  },
  vs: {
    name: 'Value Stability', input: 'Scalar value sequences', range: '[0, 1]',
    trajectories: ['expert'],
    purpose: 'Tests whether local value feedback is stable while continuing to provide informative updates. Spurious fluctuations can create misleading local rewards, while a flat curve provides no distinction between intermediate states.',
    cohort: 'Successful demonstrations are sampled in the forward direction at 5 Hz to examine local fluctuations and flat intervals in the value curve. Failure branches and alternative-solution episodes are excluded from this cohort.',
    preparation: ['For N predictions vᵢ at timestamps tᵢ, form a processed sequence ṽᵢ by replacing the first and last three predictions with their respective means. The efficiency ratio ER uses this sequence; non-flat time coverage C uses the raw values and timestamps.'],
    formulas: [
      { tex: tex`\mathrm{ER}=\frac{|\tilde v_N-\tilde v_1|}{\sum_{i=1}^{N-1}|\tilde v_{i+1}-\tilde v_i|}`, description: 'Net value change relative to total variation.' },
      { tex: tex`C=\frac{\sum_{i=1}^{N-1}(t_{i+1}-t_i)\mathbf 1[v_{i+1}\ne v_i]}{t_N-t_1}`, description: 'Fraction of sampled duration covered by intervals with a value update.' },
      { tex: tex`\mathrm{VS}=\mathrm{ER}\cdot C`, description: 'Per-trajectory stability score.' },
    ],
    details: ['Set ER = 1 when its denominator is zero. A constant raw sequence has C = 0 and therefore VS = 0. Average the per-trajectory products; do not multiply separately averaged ER and C values.'],
    interpretation: 'VS penalizes reversals and prolonged flatness. A stable curve can still move in the wrong direction, so the score is interpreted alongside VOC and Cycle-VOC.',
  },
  csvc: {
    name: 'Cross-Solution Value Consistency', input: 'Pairwise comparisons', range: '[−1, 1]',
    trajectories: ['expert', 'multi_solution'],
    purpose: 'Tests whether the same semantic subtask receives comparable value gains across valid execution orders. Consistent local credit helps avoid weighting equivalent training segments differently merely because of their position in an execution.',
    cohort: 'Successful executions of the same task cover different valid subtask orders. Annotated boundaries align the same semantic subtask across those solutions. Published results cover the standard setting.',
    preparation: ['For subtask a in solution q, take the median signed comparison over m state pairs near its annotated start and end. Use four pairs, allowing repeated pairs for very short subtasks. Match subtasks by meaning, not by their temporal positions.', 'Let 𝒜 be the evaluated semantic subtasks and 𝒮ₐ the valid solutions containing subtask a. Repetitions of the standard solution contribute a single median profile, with the same weight as each alternative solution.'],
    formulas: [
      { tex: tex`c_{q,a}=\operatorname{median}_{1\leq j\leq m}c(A_j^-,A_j^+;l),\qquad \widetilde c_a=\operatorname{median}_{q\in\mathcal S_a}c_{q,a}`, description: 'Subtask gain within a solution and its median across solutions.' },
      { tex: tex`G=\sqrt{\frac{1}{|\mathcal A|}\sum_{a\in\mathcal A}\widetilde c_a^2}`, description: 'Root-mean-square magnitude of the median subtask gains.' },
      { tex: tex`D=\sqrt{\frac{1}{|\mathcal A|}\sum_{a\in\mathcal A}\frac{1}{|\mathcal S_a|}\sum_{q\in\mathcal S_a}(c_{q,a}-\widetilde c_a)^2}`, description: 'Root-mean-square deviation across solutions, weighting semantic subtasks equally.' },
      { tex: tex`\mathrm{CSVC}=\frac{G-D}{G+D}`, description: 'Gain magnitude relative to cross-solution variation.' },
    ],
    details: ['When G + D = 0, assign −1. Missing matched subtask coverage is reported as N/A, not as a zero-gain observation.'],
    interpretation: 'CSVC compares local subtask gains without requiring identical complete value curves. Consistency alone does not establish correct progress, and differences in gain must also be interpreted in light of the model’s value semantics and execution context.',
  },
};
