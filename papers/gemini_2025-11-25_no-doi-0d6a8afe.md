---
title: 'Subject-Independent Ground Reaction Force Estimation during Walking Using Multi-Kernel Convolutional Neural Networks'
authors: 'Z. Li, T. Zhao, H. Yang, W. Wang, G. Cui, and W. Zhang'
journal: 'Sensors'
year: 2022
volume: 22
issue: 14
pages: 5438
doi: 'https://doi.org/10.3390/s22145438'
keywords: 'ground reaction force (GRF); inertial measurement unit (IMU); convolutional neural network (CNN); gait analysis; wearable sensors; subject-independent'
abstract: 'Accurate estimation of ground reaction forces (GRFs) during walking is crucial for gait analysis and biomechanical assessments. Wearable sensors, particularly inertial measurement units (IMUs), offer a convenient and cost-effective solution for GRF estimation. However, subject-specific models are often required to achieve satisfactory accuracy, limiting their practical application. This study proposes a subject-independent GRF estimation method based on multi-kernel convolutional neural networks (MKCNNs) using IMU data collected from the shank and thigh. The MKCNN architecture employs multiple convolutional kernels with varying sizes to extract features at different scales, enhancing the model’s ability to capture the complex relationships between IMU signals and GRFs across different subjects. The performance of the proposed MKCNN model was evaluated on a publicly available dataset, and the results demonstrated its effectiveness in estimating GRFs with reasonable accuracy in a subject-independent manner, showing potential for real-world applications.'

## Summary
This paper presents a subject-independent method for estimating Ground Reaction Forces (GRFs) during walking using inertial measurement units (IMUs) placed on the shank and thigh. The approach utilizes a multi-kernel convolutional neural network (MKCNN) to extract features at different scales from the IMU data, aiming to improve generalization across different subjects. The method is evaluated on a publicly available dataset, showing promising results for subject-independent GRF estimation.

## Key Contributions and Insights
*   Proposes a subject-independent GRF estimation method using a multi-kernel convolutional neural network (MKCNN).
*   Utilizes IMU data from the shank and thigh as input.
*   Employs multiple convolutional kernels with varying sizes to extract multi-scale features.
*   Demonstrates reasonable accuracy in subject-independent GRF estimation on a publicly available dataset.
*   Offers a potential solution for real-world applications where subject-specific calibration is impractical.

## Why this is State-of-the-Art
*   Addresses the challenge of subject-specific calibration, a common limitation in GRF estimation using wearable sensors.
*   The MKCNN architecture enhances feature extraction by capturing multi-scale information from IMU signals, potentially leading to improved generalization.
*   Evaluation on a publicly available dataset allows for comparison with other existing methods.
*   Focuses on a subject-independent approach, crucial for broader applicability and scalability of GRF estimation systems.

## Weaknesses or Limitations and How to Improve
*   The accuracy, while reasonable, may still be lower than subject-specific models.
*   The study uses a specific placement of IMUs (shank and thigh); performance with other placements might vary.
*   The dataset used might not represent the full range of gait patterns and subject characteristics.
*   The MKCNN architecture could be further optimized for computational efficiency.

**How to Improve:**
*   Investigate incorporating attention mechanisms to highlight relevant features from different IMU sensors.
*   Explore the use of domain adaptation techniques to further improve generalization across different populations and walking conditions.
*   Evaluate the performance of the MKCNN model with data from diverse populations and gait patterns.
*   Compare the MKCNN architecture with other deep learning models, such as transformers or hybrid models.
*   Investigate the impact of different sensor placements on GRF estimation accuracy.
*   Consider using a larger dataset to train the model.
*   Explore methods for real-time implementation of the MKCNN model on edge devices.
---
