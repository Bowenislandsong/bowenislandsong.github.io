---
title: "Estimation of Ground Reaction Force Using Transformer with Attention Mechanism Fusing Information from IMU and sEMG"
authors: "Xiaoyu Cui, Shikai Zhao, Yuwei Zhang, Jianhua Zhao, Yunfeng Zang, Jianwei Zhao, Xiaorong Liu"
journal: "Sensors"
year: 2024
volume: 24
issue: 3
pages: 884
doi: "https://doi.org/10.3390/s24030884"
keywords: "ground reaction force; transformer; attention mechanism; IMU; sEMG; gait analysis"
abstract: "Accurate and continuous ground reaction force (GRF) estimation during human walking is important for gait analysis, rehabilitation training, and exoskeleton control. Inertial measurement units (IMUs) and surface electromyography (sEMG) sensors are widely used in wearable systems for gait analysis due to their portability and convenience. However, GRF estimation using only IMU data may be affected by individual differences and environmental changes, while sEMG signals are susceptible to noise and fatigue. To address these issues, we propose a novel GRF estimation method using a transformer network with an attention mechanism to fuse information from IMU and sEMG data. The transformer network can effectively capture the long-range dependencies between different time steps of the input signals, and the attention mechanism can adaptively weight the contributions of different sensors and features. We collected a dataset of synchronous IMU, sEMG, and GRF data from 10 healthy subjects during walking. The experimental results show that the proposed method outperforms existing methods based on IMU or sEMG data alone, achieving a normalized root mean square error (NRMSE) of 7.21 ± 1.35% and a Pearson correlation coefficient (R) of 0.98 ± 0.01 for GRF estimation. Furthermore, the attention weights learned by the network provide insights into the relative importance of different sensors and muscles during different phases of the gait cycle."
---
## Summary
This paper presents a method for estimating ground reaction force (GRF) during walking by fusing data from Inertial Measurement Units (IMUs) and surface Electromyography (sEMG) sensors using a Transformer network with an attention mechanism. The proposed approach leverages the strengths of both sensor modalities and the Transformer's ability to capture long-range dependencies to improve GRF estimation accuracy. The attention mechanism adaptively weights the contributions of different sensors and features.

## Key Contributions and Insights
*   A novel GRF estimation method using a Transformer network with attention mechanism for fusing IMU and sEMG data.
*   The use of a Transformer to capture long-range dependencies in gait signals.
*   Adaptive weighting of sensor contributions through the attention mechanism.
*   Improved GRF estimation accuracy compared to methods using only IMU or sEMG data.
*   Insight into sensor and muscle importance during different gait phases via attention weights.

## Why this is State-of-the-Art
The paper incorporates multiple data streams (IMU and sEMG) in a principled manner. The utilization of a Transformer architecture is state-of-the-art for sequence modeling and it allows for attention-based feature weighting. The performance is strong. The use of interpretable attention weights is a valuable addition.

## Weaknesses or Limitations and How to Improve
*   The dataset size (10 subjects) is relatively small, limiting the generalizability of the model. Increasing the number of subjects, and including a more diverse population (different ages, weights, gait abnormalities) would improve robustness.
*   The study was conducted on level-ground walking only. Extending the method to other locomotion activities, such as stair climbing or running, would broaden its applicability.
*   The paper focuses on healthy subjects. Further research is needed to evaluate the performance of the method on individuals with gait disorders or impairments.
*   The computational complexity of the Transformer network could be a limitation for real-time applications. Exploring techniques for model compression or optimization could address this issue.
*   The placement and number of sEMG sensors could be optimized through sensitivity analysis.
