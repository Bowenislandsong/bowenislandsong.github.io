---
title: "Estimation of Ground Reaction Forces during Walking using Transformer and U-Net Based Deep Learning Model with Single Inertial Measurement Unit"
authors: "Yoonho Lee, Jonghyun Lee, Sungho Cho"
journal: "Sensors"
year: 2023
volume: 23
issue: 14
pages: 6397
doi: "https://doi.org/10.3390/s23146397"
keywords: "ground reaction force; inertial measurement unit; transformer; U-Net; gait analysis; deep learning; human locomotion; biomechanics"
abstract: "Ground reaction force (GRF) data are critical for analyzing human locomotion and developing assistive devices. However, acquiring GRF data usually requires expensive and laboratory-based equipment. To address this limitation, this paper proposes a novel deep learning model for estimating GRF using data from a single inertial measurement unit (IMU) attached to the lower back during walking. The proposed model integrates a transformer and U-Net architecture to effectively capture both temporal dependencies and local features in the IMU data. The transformer is used to extract global contextual information from the IMU signal, while the U-Net is used to capture the local features of the signal. The results of the proposed model are compared with those of other deep learning models, such as CNN, LSTM, and transformer-based models. The experimental results show that the proposed model outperforms other deep learning models in terms of GRF estimation accuracy. Specifically, the proposed model achieves an average root mean square error (RMSE) of 0.12 BW and a coefficient of determination (R2) of 0.92 for GRF estimation. These results demonstrate the effectiveness of the proposed model for estimating GRF using a single IMU sensor, which has the potential to be used in various applications, such as gait analysis and rehabilitation."
---
## Summary
This paper presents a novel deep learning model that combines a Transformer and U-Net architecture to estimate Ground Reaction Forces (GRF) during walking using data from a single IMU placed on the lower back. The model leverages the Transformer's ability to capture long-range temporal dependencies and the U-Net's strength in extracting local features from the IMU signal. The proposed model demonstrated superior performance compared to traditional CNN, LSTM, and transformer-only models.

## Key Contributions and Insights
*   A novel deep learning architecture combining a Transformer and U-Net for GRF estimation from a single IMU.
*   Demonstrated improved accuracy in GRF estimation compared to CNN, LSTM, and transformer-based models using experimental data.
*   Emphasized the importance of capturing both global temporal context and local features for accurate GRF estimation.
*   Achieved a Root Mean Square Error (RMSE) of 0.12 BW and a coefficient of determination (R2) of 0.92 for GRF estimation, showcasing high accuracy.
*   Showed the feasibility of using a single IMU for reliable GRF estimation, reducing the complexity and cost of data acquisition.

## Why this is State-of-the-Art
This work is state-of-the-art due to its innovative combination of Transformer and U-Net architectures, which addresses the limitations of using either architecture alone for time-series data processing in biomechanics. The fusion allows for a more comprehensive feature extraction by capturing both global and local patterns from IMU signals. The accuracy metrics reported (RMSE and R2) are also competitive. Single IMU placement also increases the potential for practical application.

## Weaknesses or Limitations and How to Improve
*   **Limited Dataset Diversity:** The paper may not have explored a diverse dataset including subjects with various gait abnormalities, ages, or body types. Future work should focus on validating the model's performance across a broader range of populations.
*   **IMU Placement Sensitivity:** The lower back IMU placement, while practical, might be sensitive to individual variations in movement. Investigating optimal placement strategies or incorporating techniques to mitigate the impact of placement variability would be beneficial.
*   **Lack of Real-Time Implementation Analysis:** The paper lacks a discussion on the computational efficiency and feasibility of real-time implementation. Addressing these aspects would enhance the practical applicability of the model. Further work should include runtime evaluation.
*   **Generalizability to Other Activities:** The model is specifically trained for level-ground walking. Investigating its transferability to other activities like running, stair climbing, or turning would broaden its scope.
*   **Explainability:** The Transformer and U-Net models are relatively black boxes. Future research should focus on methods to improve the interpretability of the model, such as attention visualization or feature importance analysis.
