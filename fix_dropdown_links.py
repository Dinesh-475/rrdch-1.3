import os

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. Update About Us top link
        content = content.replace(
            '<a href="about.html" class="nav-link has-dropdown">About Us</a>',
            '<a href="#" class="nav-link has-dropdown">About Us</a>'
        )
        # Add Overview to About Us dropdown
        content = content.replace(
            '<div class="dropdown-menu">\n                    <a href="about.html#trust" class="dropdown-item">Trust</a>',
            '<div class="dropdown-menu">\n                    <a href="about.html" class="dropdown-item" style="font-weight: 600; color: var(--primary);">About College (Overview)</a>\n                    <a href="about.html#trust" class="dropdown-item">Trust</a>'
        )
        
        # 2. Update Departments top link
        content = content.replace(
            '<a href="departments.html" class="nav-link has-dropdown">Departments</a>',
            '<a href="#" class="nav-link has-dropdown">Departments</a>'
        )
        # Add Overview to Departments
        content = content.replace(
            '<div class="dropdown-menu mega-menu">\n                    <a href="departments.html" class="dropdown-item">Oral Medicine and Radiology</a>',
            '<div class="dropdown-menu mega-menu">\n                    <a href="departments.html" class="dropdown-item" style="font-weight: 600; color: var(--primary); grid-column: span 2; border-bottom: 1px solid var(--border-color); margin-bottom: 0.5rem; padding-bottom: 0.5rem;">All Departments Directory</a>\n                    <a href="departments.html" class="dropdown-item">Oral Medicine and Radiology</a>'
        )
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
