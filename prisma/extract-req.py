import sys
p = r"C:\Users\ChathumiPbss\.gemini\antigravity\brain\13d0b4de-6e6d-429e-9e24-a1a659d9d3ca\requirements\Telesonic_Lanka_Incentive_and_Commission_Module_Development_Requirements 01102026.pdf"

try:
    import pypdf
    reader = pypdf.PdfReader(p)
    print(f"Total pages: {len(reader.pages)}")
    found = False
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if "INC-SCR-09" in text or "SCR-09" in text or "Calculation Run" in text:
            print(f"\n==================== PAGE {i+1} ====================")
            print(text)
            found = True
    if not found:
        print("Not found by exact keyword, searching for Screen 09 or Screen 9...")
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if "Screen 9" in text or "Screen 09" in text or "09." in text:
                print(f"\n==================== PAGE {i+1} ====================")
                print(text[:1500])
except Exception as e:
    print("Error:", e)
