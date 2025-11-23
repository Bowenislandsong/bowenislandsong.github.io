```yaml
title: "Personalized Ground Reaction Force Estimation Using Hybrid Learning with Biomechanical and Deep Features"
authors: "Lee, Kyuwon; Park, Chanwoo; Kim, Juhong; Lee, Junghoon; Kwon, Ohhyun; Noh, Yoohee; Baek, Seungmin; Kang, Dongkyun; Park, Junhong; Ko, Kukjin; Jeong, Yongseok"
journal: "Sensors"
year: 2024
volume: 24
issue: 3
pages: 864
doi: "https://doi.org/10.3390/s24030864"
keywords: "ground reaction force; inertial measurement unit; biomechanical model; deep learning; personalized estimation; hybrid learning"
abstract: "Ground reaction force (GRF) is a crucial biomechanical parameter for assessing gait patterns and diagnosing musculoskeletal disorders. Accurate and personalized GRF estimation is essential for effective gait analysis. This study presents a novel hybrid learning approach that integrates biomechanical and deep learning features for personalized GRF estimation. The approach involves two main steps: First, biomechanical features such as joint angles and angular velocities are extracted from inertial measurement unit (IMU) data using inverse kinematics and dynamics. Second, these biomechanical features are combined with raw IMU data as input to a deep learning model based on a convolutional neural network (CNN) and a long short-term memory (LSTM) network. The CNN extracts spatial features from the combined input, while the LSTM captures temporal dependencies. A subject-specific fine-tuning strategy is applied to personalize the model for each individual. Experimental results on a dataset of walking and running activities demonstrate that the proposed hybrid learning approach achieves superior GRF estimation accuracy compared to traditional deep learning models and biomechanical models alone. The integration of biomechanical features and deep learning provides a more comprehensive representation of gait dynamics, leading to improved personalized GRF estimation. This study contributes to the development of wearable sensor-based gait analysis systems for clinical and sports applications."
---
## Summary
This paper introduces a novel hybrid learning approach for personalized GRF estimation. It combines biomechanical features extracted from IMU data (using inverse kinematics and dynamics) with raw IMU data as input to a CNN-LSTM deep learning model. Subject-specific fine-tuning personalizes the model. The approach shows improved accuracy compared to using deep learning or biomechanical models alone.

## Key Contributions and Insights
*   A hybrid learning framework integrating biomechanical features and deep learning for GRF estimation.
*   Extraction of biomechanical features (joint angles, angular velocities) from IMU data.
*   A CNN-LSTM model to extract spatial and temporal features from combined IMU and biomechanical data.
*   Subject-specific fine-tuning for personalized GRF estimation.
*   Demonstrated superior accuracy compared to standalone deep learning or biomechanical models.

## Why this is State-of-the-Art
This work is state-of-the-art because it combines the strengths of both biomechanical modeling and deep learning. By integrating biomechanical features (derived from inverse kinematics and dynamics) with raw IMU data, it provides a more comprehensive and informative input to the deep learning model. The subject-specific fine-tuning addresses the personalization challenge in GRF estimation, leading to improved accuracy and robustness. Using a CNN-LSTM architecture is suitable for extracting both spatial and temporal features from the data.

## Weaknesses or Limitations and How to Improve
*   **Computational Cost:** Extracting biomechanical features using inverse kinematics and dynamics can be computationally expensive, potentially limiting real-time applications. Consider optimizing the biomechanical feature extraction process or exploring alternative, less computationally demanding methods.
*   **Generalizability to Unseen Activities:** The model's performance may degrade on activities significantly different from the training data (e.g., jumping, hopping). Investigate domain adaptation techniques or incorporate a wider range of activities into the training dataset.
*   **Sensitivity to IMU Placement:** The accuracy of biomechanical feature extraction depends on the accurate placement and calibration of IMUs. Explore methods for robust calibration and error correction, and investigate the use of sensor fusion with other modalities to improve robustness.
*   **Black Box Nature:** While the hybrid approach improves accuracy, the interpretability of the deep learning component remains limited. Explore techniques for visualizing and interpreting the learned features to gain insights into the underlying biomechanics. SHAP values and other Explainable AI methodologies may be useful here.
```
