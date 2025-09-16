---
title: "Estimation of Ground Reaction Forces and Moments During Gait Using a Single Inertial Measurement Unit on the Pelvis and Deep Learning"
authors: "Athanasios Tsiotas, Alexandros Glaros, Nikolaos Passalis, Anastasios Tefas"
journal: "Sensors"
year: 2022
volume: 22
issue: 17
pages: 6716
doi: "https://doi.org/10.3390/s22176716"
keywords: "ground reaction forces; inertial measurement unit; deep learning; gait analysis; force estimation"
abstract: "Estimating Ground Reaction Forces (GRFs) during gait is crucial in various applications, including rehabilitation, sports, and biomechanics. Inertial Measurement Units (IMUs) have emerged as a promising alternative to force plates for GRF estimation due to their portability and low cost. This study proposes a deep learning-based approach to estimate GRFs and Ground Reaction Moments (GRMs) during gait using data from a single IMU placed on the pelvis. A Long Short-Term Memory (LSTM) network is trained to map IMU readings to GRFs and GRMs. The model is evaluated on a publicly available dataset, and the results demonstrate accurate GRF and GRM estimation, comparable to state-of-the-art methods that utilize multiple IMUs or more complex setups. The proposed approach offers a simple and effective solution for GRF and GRM estimation using a single IMU and deep learning."
---
## Summary
This paper presents a deep learning approach utilizing a Long Short-Term Memory (LSTM) network to estimate Ground Reaction Forces (GRFs) and Ground Reaction Moments (GRMs) during gait. The method uses data from a single Inertial Measurement Unit (IMU) placed on the pelvis, offering a simplified and portable solution compared to systems relying on multiple IMUs or force plates. The performance is evaluated on a public dataset, demonstrating accuracy comparable to existing state-of-the-art techniques.

## Key Contributions and Insights
*   Demonstrates accurate GRF and GRM estimation using a single pelvis-mounted IMU.
*   Employs an LSTM network for mapping IMU readings to GRFs and GRMs.
*   Provides a portable and cost-effective alternative to force plates and multi-IMU systems.
*   Achieves performance comparable to state-of-the-art methods.
*   Uses publicly available dataset for transparent evaluation and reproducibility.

## Why this is State-of-the-Art
This work is state-of-the-art due to its simplified sensor setup (single IMU) while achieving comparable accuracy to more complex, multi-sensor systems. The use of a deep learning model (LSTM) allows for capturing temporal dependencies in gait data, leading to improved GRF and GRM estimation. The use of a public dataset enables transparent comparison and validation of the approach, contributing to the advancement of the field.

## Weaknesses or Limitations and How to Improve
*   The model's generalization ability to different populations (e.g., individuals with gait abnormalities) may be limited. Improve by training on more diverse datasets.
*   The performance may be sensitive to IMU placement variations. Develop a more robust method to mitigate the effects of small placement changes or introduce a calibration step.
*   The study does not explicitly address real-time implementation challenges. Investigate methods for optimizing the model for real-time processing and deployment on embedded systems.
*   The reliance on LSTM may limit capturing very long range dependencies within the gait cycle. Explore transformer-based architectures.
