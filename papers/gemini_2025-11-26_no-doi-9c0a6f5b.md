---
title: "Improving Ground Reaction Force Estimation by Leveraging Kinematic and Kinetic Synergies"
authors: "Yang Li, Jiawei Zhao, Qian Wang, Pengcheng Liu, Song Li, Yaping Chen"
journal: "IEEE Transactions on Neural Systems and Rehabilitation Engineering"
year: 2024
volume: 32
issue: 6
pages: 1767-1775
doi: "10.1109/TNSRE.2024.3375122"
keywords: "Ground reaction force estimation, inertial measurement unit, kinematic synergy, kinetic synergy, deep learning."
abstract: "Accurate ground reaction force (GRF) estimation is crucial for human movement analysis. Inertial measurement unit (IMU)-based GRF estimation provides a convenient alternative to force platforms. However, the inherent complexity and variability of human gait pose significant challenges. To address these issues, we propose a novel deep learning framework that leverages both kinematic and kinetic synergies to improve GRF estimation. First, kinematic and kinetic synergies are extracted from the IMU data and GRF data via principal component analysis (PCA), respectively. Then, we train two separate deep neural networks to estimate the kinematic and kinetic synergy coefficients. Finally, the GRF is reconstructed using the estimated kinetic synergy coefficients and the kinetic synergy basis vectors. Experiments on a public dataset show that the proposed method outperforms existing state-of-the-art methods in terms of accuracy and robustness. The results demonstrate the effectiveness of leveraging kinematic and kinetic synergies for GRF estimation."
---
## Summary
This paper presents a deep learning framework for estimating ground reaction forces (GRF) from inertial measurement unit (IMU) data by leveraging kinematic and kinetic synergies extracted via Principal Component Analysis (PCA). The framework trains separate neural networks to predict kinematic and kinetic synergy coefficients, which are then used to reconstruct the GRF. The results demonstrate improved accuracy and robustness compared to existing methods.

## Key Contributions and Insights
*   The paper introduces a novel approach that exploits kinematic and kinetic synergies using PCA for GRF estimation.
*   The framework uses separate deep neural networks to estimate kinematic and kinetic synergy coefficients, enhancing model specialization.
*   Experimental results on a public dataset demonstrate improved accuracy and robustness compared to state-of-the-art GRF estimation methods.
*   The study highlights the effectiveness of synergy-based approaches for capturing complex gait dynamics in GRF estimation.

## Why this is State-of-the-Art
The paper advances the state-of-the-art by explicitly modeling kinematic and kinetic synergies, allowing the model to better capture the underlying structure of human movement and improve GRF estimation accuracy. The decomposition via PCA helps reduce dimensionality and focus on essential features, leading to better performance.

## Weaknesses or Limitations and How to Improve
*   The method relies on PCA for synergy extraction, which may not capture complex nonlinear relationships in the data. Consider exploring nonlinear dimensionality reduction techniques like autoencoders for synergy extraction.
*   The study uses a single public dataset. Validating the framework on diverse datasets with varying populations and gait patterns would strengthen its generalizability.
*   The framework uses separate networks for kinematic and kinetic synergies. Investigating a joint learning approach may further improve performance by exploiting the interdependencies between these synergies.
