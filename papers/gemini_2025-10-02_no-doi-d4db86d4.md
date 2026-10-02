---
title: "Domain Adaptation for Ground Reaction Force Estimation across Different Walking Speeds Using a Hybrid CNN-Transformer Model"
authors: "Hyunwoo Song, Jaehoon Jung, Jungho Lee, Byounghyun Jeon"
journal: "Sensors"
year: 2024
volume: 24
issue: 5
pages: 1430
doi: "https://doi.org/10.3390/s24051430"
keywords: "ground reaction force; inertial measurement unit; domain adaptation; convolutional neural network; transformer; walking speed"
abstract: "Estimating ground reaction forces (GRFs) during walking is essential for various applications, including gait analysis and rehabilitation. This study proposes a hybrid convolutional neural network (CNN) and transformer-based deep learning model combined with a domain adaptation strategy to estimate GRFs from inertial measurement unit (IMU) data across different walking speeds. The model comprises a CNN module for extracting local features from IMU signals and a transformer module for capturing long-range dependencies. A domain adaptation technique is incorporated to mitigate the performance degradation caused by variations in walking speeds between the training and testing datasets. The proposed approach is evaluated on a publicly available dataset, and the results demonstrate its effectiveness in estimating GRFs across different walking speeds. The hybrid CNN-transformer architecture, combined with domain adaptation, outperforms conventional methods, offering a robust and accurate solution for GRF estimation in real-world scenarios."
---
## Summary
This paper presents a hybrid CNN-Transformer model with domain adaptation for estimating ground reaction forces (GRFs) from IMU data across different walking speeds. The model aims to improve GRF estimation accuracy when there are variations in walking speeds between the training and testing data. The approach combines a CNN for local feature extraction from IMU signals with a Transformer for capturing long-range dependencies.

## Key Contributions and Insights
*   Proposes a hybrid CNN-Transformer model for GRF estimation.
*   Incorporates domain adaptation to address walking speed variations.
*   Evaluates the model on a publicly available dataset, demonstrating improved performance.
*   Shows that the hybrid architecture with domain adaptation outperforms conventional methods for GRF estimation.
*   Addresses the challenge of GRF estimation across different walking speeds, which is a common problem in real-world applications.

## Why this is State-of-the-Art
This work is state-of-the-art because it combines a hybrid CNN-Transformer architecture, which leverages the strengths of both CNNs and Transformers, and incorporates domain adaptation specifically to address variations in walking speeds. Domain adaptation is crucial for deploying GRF estimation models in real-world scenarios where walking speeds may vary significantly. The evaluation on a public dataset also contributes to the reproducibility and comparability of the results.

## Weaknesses or Limitations and How to Improve
*   The study focuses primarily on walking speed as the domain adaptation factor. Other factors, such as gait patterns, subject characteristics, and terrain, could also influence GRF estimation. Future work should explore multi-domain adaptation techniques.
*   The model's complexity may require significant computational resources, potentially limiting its deployment on embedded systems. Model compression or simplification techniques could be explored to reduce computational cost.
*   The evaluation is based on a single public dataset. Testing the model on other datasets, especially those with more diverse populations and gait conditions, would further validate its robustness.
*   The paper provides limited insight into the specific domain adaptation technique employed. A more detailed explanation of the chosen method and its rationale would enhance the understanding and reproducibility of the work.
*   Investigate the model's sensitivity to IMU placement and orientation. Addressing this would increase the practical applicability of the model.
