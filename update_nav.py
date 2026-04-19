import os
import re

html_nav = """        <ul class="nav-links">
            <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
            
            <li class="nav-item">
                <a href="about.html" class="nav-link has-dropdown">About Us</a>
                <div class="dropdown-menu">
                    <a href="about.html#trust" class="dropdown-item">Trust</a>
                    <a href="about.html#management" class="dropdown-item">Management</a>
                    <a href="about.html#governing" class="dropdown-item">Governing Council</a>
                    <a href="about.html#vision" class="dropdown-item">Vision and Mission</a>
                </div>
            </li>

            <li class="nav-item">
                <a href="departments.html" class="nav-link has-dropdown">Departments</a>
                <div class="dropdown-menu mega-menu">
                    <a href="departments.html" class="dropdown-item">Oral Medicine and Radiology</a>
                    <a href="departments.html" class="dropdown-item">Prosthodontics and Crown & Bridge</a>
                    <a href="departments.html" class="dropdown-item">Oral and Maxillofacial Surgery</a>
                    <a href="departments.html" class="dropdown-item">Periodontology</a>
                    <a href="departments.html" class="dropdown-item">Cons. Dentistry & Endodontics</a>
                    <a href="departments.html" class="dropdown-item">Orthodontics & Dentofacial Ortho</a>
                    <a href="departments.html" class="dropdown-item">Public Health Dentistry</a>
                    <a href="departments.html" class="dropdown-item">Oral and Maxillofacial Pathology</a>
                    <a href="departments.html" class="dropdown-item">Implantology</a>
                    <a href="departments.html" class="dropdown-item">Research and Publications</a>
                    <a href="departments.html" class="dropdown-item">Orofacial Pain</a>
                </div>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link has-dropdown">Courses</a>
                <div class="dropdown-menu">
                    <a href="#" class="dropdown-item">BDS – Bachelor of Dental Surgery</a>
                    <a href="#" class="dropdown-item">MDS – Master of Dental Surgery</a>
                    <a href="#" class="dropdown-item">PhD</a>
                    <a href="#" class="dropdown-item">Certificate Courses</a>
                </div>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link has-dropdown">Academics</a>
                <div class="dropdown-menu">
                    <a href="admission_enquiry.html" class="dropdown-item">Admission Enquiry (25–26)</a>
                    <a href="#" class="dropdown-item">Results</a>
                    <a href="#" class="dropdown-item">E-Content</a>
                    <a href="#" class="dropdown-item">Achievements</a>
                    <a href="#" class="dropdown-item">Extracurricular Activities</a>
                </div>
            </li>

            <li class="nav-item">
                <a href="#" class="nav-link has-dropdown">Facilities</a>
                <div class="dropdown-menu mega-menu">
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">🎭</span> Auditorium</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">☕</span> Cafeteria</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">🏫</span> Classrooms</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">💻</span> Digital Library</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">🏋️</span> Gymnasium</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">🏢</span> Hostel</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">⚽</span> Sports & Recreation</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">🚌</span> Transportation</a>
                    <a href="#" class="dropdown-item"><span class="dropdown-icon">📶</span> Wi-Fi</a>
                </div>
            </li>

            <li class="nav-item"><a href="admissions.html" class="nav-link">Admissions</a></li>
            <li class="nav-item"><a href="contact.html" class="nav-link">Contact</a></li>
            <li class="nav-item"><a href="patients.html" class="nav-link">Patient Portal</a></li>
        </ul>"""

regex = re.compile(r'<ul class="nav-links">.*?</ul>', re.DOTALL)

for file in os.listdir('.'):
    if file.endswith('.html'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = regex.sub(html_nav, content)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
