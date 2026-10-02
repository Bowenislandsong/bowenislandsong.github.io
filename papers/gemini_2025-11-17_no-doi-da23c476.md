---
title: "Estimating Ground Reaction Forces in Different Gait Patterns Based on Multi-Mode Fusion of IMU Signals"
authors: "Zhiyuan Zhang, Zhenzhong Kuang, Qiming Zhang, Qiang Huang, Liang Zhao"
journal: "Sensors"
year: 2024
volume: 24
issue: 8
pages: 2466
doi: "https://doi.org/10.3390/s24082466"
keywords: "ground reaction force; inertial measurement unit; gait pattern recognition; multi-mode fusion; deep learning"
abstract: "Ground reaction force (GRF) is a crucial biomechanical parameter for gait analysis and rehabilitation training. Inertial measurement units (IMUs) offer a convenient and cost-effective solution for GRF estimation. However, existing IMU-based GRF estimation methods often struggle to accurately capture the variations in GRF caused by different gait patterns. To address this issue, we propose a multi-mode fusion framework for GRF estimation that considers various gait patterns. First, we recognize the gait pattern using a deep learning model based on IMU signals. Then, we design different GRF estimation models for each gait pattern and fuse the results based on the gait pattern recognition. Experimental results show that our method achieves state-of-the-art performance in GRF estimation under different gait patterns."

## Summary
This paper presents a multi-mode fusion framework for estimating ground reaction forces (GRF) using IMU data. The framework first identifies the gait pattern using a deep learning model and then employs different GRF estimation models tailored to each identified gait pattern, ultimately fusing the estimations to improve overall accuracy.

## Key Contributions and Insights
*   A multi-mode fusion framework is proposed to improve GRF estimation accuracy by considering variations in gait patterns.
*   Gait pattern recognition is integrated into the GRF estimation pipeline.
*   Different GRF estimation models are designed and used for each gait pattern.
*   The proposed method achieves state-of-the-art performance under different gait patterns.

## Why this is State-of-the-Art
This approach is state-of-the-art because it moves beyond single-model GRF estimation by adapting the estimation process based on the identified gait pattern. This is a significant improvement over methods that treat all gait patterns the same, especially when generalizing the models to new unseen conditions.

## Weaknesses or Limitations and How to Improve
*   The accuracy of gait pattern recognition directly affects GRF estimation. Erroneous classification could lead to decreased GRF estimation performance. Improvement: Investigating more robust gait pattern recognition models or incorporating uncertainty measures into the fusion process to mitigate the impact of misclassification.
*   The complexity of the framework may increase computational cost. Improvement: Model compression techniques or efficient hardware implementation could be used to address this limitation.
*   The number of gait patterns considered may be limited. Improvement: The framework can be extended to handle a wider range of gait patterns through incorporating more diverse training data and refining the gait pattern recognition model.
---
