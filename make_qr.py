import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image

URL = "https://thanks.socialeagle.ai"
OUT_DIR = r"C:/Users/AI Eagles/OneDrive/Desktop/GDD_form"

# High error correction so the centered logo doesn't break scanning.
qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_H,
    box_size=20,     # px per module -> large, print-ready
    border=4,        # quiet zone (spec minimum is 4)
)
qr.add_data(URL)
qr.make(fit=True)

# Dark near-black for max contrast/scannability, white background.
img = qr.make_image(fill_color="#111417", back_color="white").convert("RGBA")

# --- Center logo on a white rounded pad ---
logo = Image.open(OUT_DIR + "/logo.png").convert("RGBA")

qr_w, qr_h = img.size
# Logo box ~ 22% of QR width (safe with error correction H = ~30% redundancy)
target_w = int(qr_w * 0.22)
ratio = target_w / logo.width
target_h = int(logo.height * ratio)
logo = logo.resize((target_w, target_h), Image.LANCZOS)

# White backing pad behind the logo so modules under it are cleared.
pad_x = int(target_w * 0.18)
pad_y = int(target_h * 0.35)
pad_w = target_w + pad_x * 2
pad_h = target_h + pad_y * 2
pad = Image.new("RGBA", (pad_w, pad_h), (255, 255, 255, 255))

pad_pos = ((qr_w - pad_w) // 2, (qr_h - pad_h) // 2)
img.alpha_composite(pad, pad_pos)

logo_pos = ((qr_w - target_w) // 2, (qr_h - target_h) // 2)
img.alpha_composite(logo, logo_pos)

png_path = OUT_DIR + "/qr_thanks_socialeagle.png"
img.convert("RGB").save(png_path, "PNG")
print("Saved:", png_path, img.size)

# Also a plain (logo-free) version for absolute max reliability / small print.
plain = qr.make_image(fill_color="black", back_color="white")
plain_path = OUT_DIR + "/qr_thanks_socialeagle_plain.png"
plain.save(plain_path)
print("Saved:", plain_path)
