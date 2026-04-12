from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Input
from tensorflow.keras.regularizers import l2

def build_model(input_dim: int):
    model = Sequential([
        Input(shape=(input_dim,)),
        Dense(32, activation='relu', kernel_regularizer=l2(0.001)),
        Dropout(0.4),
        Dense(16, activation='relu', kernel_regularizer=l2(0.001)),
        Dropout(0.4),
        Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )

    return model