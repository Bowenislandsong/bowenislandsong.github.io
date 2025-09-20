---
title: 'Estimating Ground Reaction Forces with Transformer and Optimal Sensor Fusion Based on Inertial Measurement Units'
authors: 'Yifan Zhang, Lei Wang, Yuqing Xue, Huiyan Li, Chao Chen, Jinlong Li'
journal: 'Sensors'
year: 2024
volume: 24
issue: 3
pages: 923
doi: 'https://doi.org/10.3390/s24030923'
keywords: 'ground reaction forces; transformer; sensor fusion; gait analysis; inertial measurement units; biomechanics'
abstract: 'Accurate estimation of ground reaction forces (GRFs) is crucial for biomechanical analysis of human movement. This paper proposes a novel method based on a transformer network and optimal sensor fusion to estimate GRFs using inertial measurement units (IMUs). We first placed IMUs on multiple body segments and designed a sensor fusion strategy based on an information entropy criterion to select the most informative IMU combination. Then, a transformer network was trained to map the selected IMU data to GRFs. The proposed method was validated on a public gait dataset. The results demonstrated that the proposed method achieved promising performance in GRF estimation and outperformed existing methods. The optimal sensor fusion strategy also contributed to improved accuracy and reduced computational cost. The proposed method has the potential to be applied in various fields, such as sports training, rehabilitation, and clinical gait analysis.'
---

## Summary
This paper introduces a novel approach for estimating ground reaction forces (GRFs) using a transformer network and optimal sensor fusion based on inertial measurement units (IMUs). The method involves strategically placing IMUs on multiple body segments, employing an information entropy-based criterion for optimal IMU selection, and training a transformer network to map the fused IMU data to GRFs. Validation on a public gait dataset demonstrated improved accuracy and reduced computational cost compared to existing methods.

## Key Contributions and Insights
*   A novel GRF estimation method using a transformer network and IMU sensor fusion.
*   An information entropy-based criterion for selecting the most informative IMU combination.
*   Demonstrated improved GRF estimation accuracy compared to existing methods.
*   Reduced computational cost through optimal sensor fusion.
*   Validation on a public gait dataset.

## Why this is State-of-the-Art
This work advances the state-of-the-art by leveraging the power of transformer networks, which are well-suited for capturing long-range dependencies in sequential data like IMU signals, for GRF estimation. The optimal sensor fusion strategy based on information entropy is also a novel approach for selecting the most relevant IMU data, leading to improved accuracy and computational efficiency. The method's performance on a public gait dataset adds to its credibility and potential for real-world applications.

## Weaknesses or Limitations and How to Improve
*   The method's performance may be dependent on the specific placement of IMUs and the chosen information entropy criterion. Further investigation into different sensor placement strategies and entropy measures could be beneficial.
*   The validation was performed on a public gait dataset, which may not represent the diversity of real-world gait patterns. Evaluating the method on a larger and more diverse dataset would be crucial.
*   The study does not explore the robustness of the method to variations in gait speed, terrain, or subject characteristics. Investigating the method's performance under different conditions and exploring personalization techniques could improve its generalizability.
*   The computational cost reduction achieved through sensor fusion should be quantified and compared against alternatives.
