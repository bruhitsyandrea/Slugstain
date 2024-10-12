from PIL import Image, ImageDraw, ImageFont
import pytesseract

print(pytesseract.image_to_string(Image.open('recipt.jpg')))
