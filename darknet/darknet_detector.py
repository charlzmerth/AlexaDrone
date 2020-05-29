# from darknetpy.detector import Detector

class DarknetDetector:
    
    def __init__(self, data, cfg, weights)
        self.data = data
        self.cfg = cfg
        self.weights = weights
        # self.__detector = Detector(data, cfg, weights)
        
    def get_detections(img)
        # detections = self.__detector.detect(img)
        detections = [{'right': 194, 'bottom': 353, 'top': 264, 'class': 'pencil', 'prob': 0.8198755383491516, 'left': 71}, {'right': 0, 'bottom': 200, 'top': 0, 'class': 'shoe', 'prob': 0.6548862, 'left': 200}]
        return detections