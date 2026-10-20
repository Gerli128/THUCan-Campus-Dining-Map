from pathlib import Path
import fitz

source = Path("attached_assets/ball_1792503330119.pdf")
output = Path(".agents/outputs/tsinghua_pdf")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
print(f"pages={document.page_count}")
for index, page in enumerate(document):
    pixmap = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
    destination = output / f"page-{index + 1:02d}.png"
    pixmap.save(destination)
    print(destination)
