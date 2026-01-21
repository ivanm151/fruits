const HF_BASE_URL = "https://ivanm151-fruits.hf.space";

export async function predictFull({
                                      file,
                                      pointX,
                                      pointY,
                                      returnCropped = true,
                                      croppedSize = 224,
                                  }) {
    const formData = new FormData();
    formData.append("file", file);

    const url =
        `${HF_BASE_URL}/predict_full` +
        `?point_x=${pointX}` +
        `&point_y=${pointY}` +
        `&return_cropped=${returnCropped}` +
        `&cropped_size=${croppedSize}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HF error ${response.status}: ${text}`);
    }

    return await response.json();
}
