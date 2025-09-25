---
title: "Estimating ground reaction forces with transformer-based domain adaptation using inertial-measurement-unit data"
authors: "Zhao, Z., Yin, Z., Sun, M., & Yu, H."
journal: "Sensors"
year: 2024
volume: "24"
issue: "3"
pages: "887"
doi: "https://doi.org/10.3390/s24030887"
keywords: "ground reaction force; inertial measurement unit; transformer; domain adaptation; transfer learning"
abstract: "Ground reaction forces (GRFs) are essential for gait analysis and biomechanical research. While force plates offer accurate measurements, their limitations in real-world scenarios necessitate the development of portable estimation methods using inertial measurement units (IMUs). This study introduces a novel domain adaptation framework based on the transformer architecture for estimating GRFs from IMU data. The proposed method leverages source data with available GRF labels to train a model that can be adapted to new target subjects with minimal labeled data. The transformer architecture captures long-range dependencies in the IMU data, while domain adaptation techniques mitigate the discrepancies between source and target domains. Experimental results demonstrate that the proposed approach significantly improves the accuracy and generalization ability of GRF estimation compared to traditional methods, particularly in scenarios with limited labeled data from the target domain. The proposed domain adaptation strategy shows promise for personalized GRF estimation in real-world applications."
---
## Summary
This paper presents a transformer-based domain adaptation method to estimate ground reaction forces (GRFs) from inertial measurement unit (IMU) data. The method addresses the challenge of individual variations in gait by using domain adaptation techniques to transfer knowledge from a source dataset (with GRF labels) to a target subject (with limited GRF labels). The transformer architecture is used to model long-range dependencies in IMU data.

## Key Contributions and Insights
*   A transformer-based model is used to capture temporal dependencies within IMU data for GRF estimation.
*   A domain adaptation strategy is employed to reduce the impact of inter-subject variability, facilitating personalized GRF estimation with limited labeled data.
*   The proposed model outperforms traditional methods in GRF estimation, particularly when adapting to new subjects with sparse target-domain labels.
*   The approach offers a pathway to enable GRF estimation in real-world, unconstrained environments using wearable sensors.

## Why this is State-of-the-Art
This work is state-of-the-art because it leverages the power of transformer networks to model complex temporal relationships within IMU data for GRF estimation. Additionally, the integration of domain adaptation specifically addresses the challenge of personalizing GRF estimation, moving beyond generalized models trained on pooled data. Combining these two approaches improves accuracy compared to other methods, especially in situations where target-specific labeled data is scarce, which is a common challenge in real-world applications.

## Weaknesses or Limitations and How to Improve
*   The paper does not provide a comprehensive analysis of the computational cost of the proposed transformer model, which can be substantial compared to simpler methods. Future work should quantify the computational resources required for training and inference, and explore model compression or pruning techniques to reduce the computational overhead for real-time applications.
*   The domain adaptation strategy might benefit from more advanced techniques such as adversarial domain adaptation or discrepancy-based methods. More comprehensive comparisons of different domain adaptation strategies would be beneficial.
*   The experimental validation could be expanded to include a broader range of gait speeds, terrains, and subject demographics. Evaluating performance across diverse conditions will enhance the generalizability and robustness of the proposed method.
