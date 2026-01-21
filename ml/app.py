from fastapi import FastAPI, UploadFile, File, Query
import torch
import numpy as np
from PIL import Image
import io
import base64
from models import load_sam, load_model2, load_model3
from utils import (
    crop_fruit_contour_letterbox,
    preprocess_for_classifier,
    FRUIT_CLASSES,
    FRESHNESS_CLASSES
)

app = FastAPI()

# Загрузка моделей
sam_predictor = load_sam()   # MobileSAM + SamPredictor
model2 = load_model2()
model3 = load_model3()

DEVICE = torch.device('cpu')

FRESHNESS_ELIGIBLE = {'apple', 'banana', 'orange', 'lemon'}

@app.get("/")
def greet_json():
    return {"swagger https://ivanm151-fruits.hf.space/docs#"}

@app.post("/predict_full")
async def predict_full(
    file: UploadFile = File(...),
    point_x: int = Query(..., description="X-координата точки на фрукте"),
    point_y: int = Query(..., description="Y-координата точки на фрукте"),
    return_cropped: bool = Query(default=True, description="Вернуть обрезанное изображение в base64?"),
    cropped_size: int = Query(224, description="Размер обрезанного изображения (100 или 224)")
):
    content = await file.read()
    image = Image.open(io.BytesIO(content)).convert('RGB')
    orig_np = np.array(image)

    # Установка изображения в MobileSAM Predictor
    sam_predictor.set_image(orig_np)

    # Промпт: точка на фрукте
    input_point = np.array([[point_x, point_y]])
    input_label = np.array([1])  # 1 = foreground

    # Предсказание маски
    masks, scores, logits = sam_predictor.predict(
        point_coords=input_point,
        point_labels=input_label,
        multimask_output=False
    )

    # Берём лучшую маску
    best_mask_idx = np.argmax(scores)
    mask = masks[best_mask_idx]  # bool

    # Проверка: есть ли фрукт?
    fruit_area_ratio = np.mean(mask)
    if fruit_area_ratio < 0.01:
        return {
            "fruit_top3": [],
            "freshness": None,
            "freshness_confidence": None,
            "cropped_base64": None
        }

    # Обрезка под 100×100 для сорта
    cropped_100 = crop_fruit_contour_letterbox(orig_np, mask, out_size=100)
    input_tensor2 = preprocess_for_classifier(cropped_100).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits2 = model2(input_tensor2)
        probs2 = torch.softmax(logits2, dim=1).squeeze().cpu().numpy()

    # ТОП-3 фрукта
    top3_indices = np.argsort(probs2)[-3:][::-1]  # индексы от самого уверенного
    top3 = [
        {
            "fruit": FRUIT_CLASSES[idx],
            "confidence": round(float(probs2[idx]), 4)
        }
        for idx in top3_indices
    ]

    # Проверяем, есть ли хотя бы один фрукт из FRESHNESS_ELIGIBLE в топ-3
    eligible_in_top3 = any(item["fruit"] in FRESHNESS_ELIGIBLE for item in top3)

    result = {
        "fruit_top3": top3,
        "freshness": None,
        "freshness_confidence": None,
        "cropped_base64": None
    }

    # Свежесть, если есть eligible фрукт в топ-3
    if eligible_in_top3:
        cropped_224 = crop_fruit_contour_letterbox(orig_np, mask, out_size=100)
        input_tensor3 = preprocess_for_classifier(cropped_224).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            logits3 = model3(input_tensor3)
            probs3 = torch.softmax(logits3, dim=1).squeeze().cpu().numpy()

        fresh_idx = int(np.argmax(probs3))
        fresh_name = FRESHNESS_CLASSES[fresh_idx]
        fresh_conf = float(probs3[fresh_idx])

        result["freshness"] = fresh_name
        result["freshness_confidence"] = round(fresh_conf, 4)

    # Возвращаем обрезанное изображение
    if return_cropped:
        cropped_final = crop_fruit_contour_letterbox(orig_np, mask, out_size=cropped_size)
        pil_img = Image.fromarray(cropped_final)
        buffered = io.BytesIO()
        pil_img.save(buffered, format="PNG")
        result["cropped_base64"] = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return result