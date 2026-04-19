import os
import re

files_to_update = ['about.html', 'admission_enquiry.html', 'admissions.html', 'contact.html', 'departments.html', 'doctors.html', 'patients.html', 'students.html', 'index.html']

emoji_map = {
    '🎭': '<i data-lucide="projector" width="16" height="16"></i>',
    '☕': '<i data-lucide="coffee" width="16" height="16"></i>',
    '🏫': '<i data-lucide="book-open" width="16" height="16"></i>',
    '💻': '<i data-lucide="laptop" width="16" height="16"></i>',
    '🏋️': '<i data-lucide="dumbbell" width="16" height="16"></i>',
    '🏢': '<i data-lucide="building" width="16" height="16"></i>',
    '⚽': '<i data-lucide="dribbble" width="16" height="16"></i>',
    '🚌': '<i data-lucide="bus" width="16" height="16"></i>',
    '📶': '<i data-lucide="wifi" width="16" height="16"></i>'
}

for file in files_to_update:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    for emoji, icon in emoji_map.items():
        content = content.replace(emoji, icon)
        
    # Inject lucide script if not present
    if "unpkg.com/lucide@latest" not in content:
        content = content.replace('</body>', '    <script src="https://unpkg.com/lucide@latest"></script>\n    <script>lucide.createIcons();</script>\n</body>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Icons replaced and Lucide script injected across all files.")
