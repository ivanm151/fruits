import torch
import torchvision.models as models
import torch.nn as nn
from mobile_sam import sam_model_registry, SamPredictor

DEVICE = torch.device('cpu')

sam_predictor = None  # MobileSAM + Predictor
model2 = None         # сорт фрукта
model3 = None         # свежесть

def load_sam(weights_path='weights/mobile_sam.pt'):
    global sam_predictor
    if sam_predictor is None:
        model_type = "vit_t"
        sam = sam_model_registry[model_type](checkpoint=weights_path)
        sam.to(DEVICE)
        sam.eval()
        sam_predictor = SamPredictor(sam)
    return sam_predictor

def load_model2(weights_path='weights/class.pth'):
    global model2
    if model2 is None:
        model2 = models.mobilenet_v2(pretrained=False)
        for param in model2.features.parameters():
            param.requires_grad = False
        model2.classifier[1] = nn.Linear(model2.classifier[1].in_features, 10)
        state_dict = torch.load(weights_path, map_location=DEVICE)
        model2.load_state_dict(state_dict)
        model2.eval()
    return model2

def load_model3(weights_path='weights/class2.pth'):
    global model3
    if model3 is None:
        model3 = models.mobilenet_v2(pretrained=False)
        for param in model3.features.parameters():
            param.requires_grad = False
        model3.classifier[1] = nn.Linear(model3.classifier[1].in_features, 6)
        state_dict = torch.load(weights_path, map_location=DEVICE)
        model3.load_state_dict(state_dict)
        model3.eval()
    return model3