import numpy as np
import cv2
from PIL import Image
import io
import base64
import torch
from torchvision import transforms

FRUIT_CLASSES = ['apple', 'banana', 'orange', 'strawberry', 'pear', 'lemon', 'cucumber', 'plum', 'raspberry', 'watermelon']
FRESHNESS_CLASSES = ['freshapples', 'freshbanana', 'freshoranges', 'rottenapples', 'rottenbanana', 'rottenoranges']

def preprocess_for_classifier(img: np.ndarray) -> torch.Tensor:
    transform = transforms.Compose([
        transforms.ToPILImage(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    return transform(img)

def letterbox_any_size(
    img: np.ndarray,
    target_size: int = 224,
    bg_color: tuple = (255, 255, 255)
) -> np.ndarray:
    h, w = img.shape[:2]
    scale = min(target_size / h, target_size / w)
    new_h, new_w = int(h * scale), int(w * scale)

    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

    pad_h = target_size - new_h
    pad_w = target_size - new_w
    top = pad_h // 2
    bottom = pad_h - top
    left = pad_w // 2
    right = pad_w - left

    padded = cv2.copyMakeBorder(resized, top, bottom, left, right,
                                cv2.BORDER_CONSTANT, value=bg_color)
    return padded

def crop_fruit_contour_letterbox(
    orig_img: np.ndarray,
    mask: np.ndarray,
    out_size: int = 224,
    bg_color: tuple = (255, 255, 255)
) -> np.ndarray:
    mask_bin = (mask > 0.5).astype(np.uint8)

    ys, xs = np.where(mask_bin == 1)
    if len(xs) == 0:
        return np.full((out_size, out_size, 3), bg_color, dtype=np.uint8)

    y1, y2 = ys.min(), ys.max()
    x1, x2 = xs.min(), xs.max()

    cropped_rgb = orig_img[y1:y2+1, x1:x2+1].copy()
    cropped_mask = mask_bin[y1:y2+1, x1:x2+1]

    # Сначала letterbox
    letterboxed = letterbox_any_size(cropped_rgb, target_size=out_size, bg_color=bg_color)

    # Масштабируем маску под letterbox (это сложнее, но можно приблизить)
    # Для простоты — применяем маску на cropped перед letterbox
    white_bg = np.full_like(cropped_rgb, bg_color)
    masked_cropped = np.where(cropped_mask[..., None] == 1, cropped_rgb, white_bg)

    final = letterbox_any_size(masked_cropped, target_size=out_size, bg_color=bg_color)

    return final