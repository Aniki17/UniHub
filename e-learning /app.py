from flask import Flask, render_template, send_file, abort, redirect, url_for
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Define the structure of courses by year, branch, and subjects
course_structure = {
    "1": {  # First Year
        "CMPN": ["Engineering Mathematics I", "Physics-I", "Chemistry-I", "BEE", "Mechanics", "C-Programming", "Chemistry-II", "Physics-II", "Engineering Mathematics II", "Engineering Graphics", "PCE"],
        "IT": ["Engineering Mathematics I", "Physics-I", "Chemistry-I", "BEE", "Mechanics", "C-Programming", "Chemistry-II", "Physics-II", "Engineering Mathematics II", "Engineering Graphics", "PCE"],
        "EXTC": ["Engineering Mathematics I", "Physics-I", "Chemistry-I", "BEE", "Mechanics", "C-Programming", "Chemistry-II", "Physics-II", "Engineering Mathematics II", "Engineering Graphics", "PCE"]
    },
    "2": {  # Second Year
        "CMPN": ["Engineering Mathematics III","Data Structures", "DLCA", "Computer Graphics", "Engineering Mathematics IV", "DSGT", "AOA", "DBMS", "MP", "OS"],
        "IT": ["Engineering Mathematics III", "Data Structures", "DBMS", "PCOM", "PCPF", "Engineering Mathematics IV", "CN", "OS", "COA", "AT"],
        "EXTC": ["Engineering Mathematics III", "DSD", "EDC", "EICS", "NT", "Engineering Mathematics IV", "LIC", "Microcontroller", "PCOM", "SS"]
    },
    "3": {  # Third Year
        "CMPN": ["CN", "DWM", "IP", "SE", "TCS", "AI", "CSS", "IOT", "MC", "SPCC"],
        "IT": ["ADBMS", "CNS", "Entrpreneurship&R-Buisness", "IP", "SE", "AI&DS", "DM&BI", "WebXO", "Wireless Technology"],
        "EXTC": ["Data Compression & Cryptography", "Digital Communication", "Digital VLSI", "Discrete Time Signal Processing", "IT Infra and Security", "Random Signal Analysis"]
    },
    "4": {  # Fourth Year
        "CMPN": ["Big Data Analytic", "Blockchain", "Cybersecurity and Laws", "Machine Learning", "Management Information System", "Natural Language Processing"],
        "IT": ["Database Systems", "Web Technologies", "Operating Systems"],
        "EXTC": ["Analog Electronics", "Digital Communication", "Microcontrollers"]
    }
}

# Ensure the ebooks directory exists
def setup_directories():
    for year in course_structure:
        for branch in course_structure[year]:
            directory = os.path.join('ebooks', year, branch.lower())
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")

# Helper function to convert subject name to filename
def get_filename(subject):
    return subject.lower().replace(" ", "_") + ".pdf"

# Helper function to get full path for a PDF
def get_pdf_path(year, branch, subject):
    filename = get_filename(subject)
    path = os.path.join('ebooks', year, branch.lower(), filename)
    return path

@app.route('/')
def home():
    return render_template('home.html', courses=course_structure)

@app.route('/year/<year>')
def year_view(year):
    if year in course_structure:
        return render_template('year.html', year=year, branches=course_structure[year])
    return abort(404)

@app.route('/year/<year>/branch/<branch>')
def branch_view(year, branch):
    if year in course_structure and branch in course_structure[year]:
        return render_template('branch.html', 
                              year=year, 
                              branch=branch, 
                              subjects=course_structure[year][branch])
    return abort(404)

@app.route('/view/<year>/<branch>/<subject>')
def view_pdf(year, branch, subject):
    # Check if the course exists
    if (year not in course_structure or 
        branch not in course_structure[year] or 
        subject not in course_structure[year][branch]):
        return abort(404)
    
    # Get file path
    pdf_path = get_pdf_path(year, branch, subject)
    
    # Check if file exists
    if not os.path.isfile(pdf_path):
        return render_template('error.html', 
                              message=f"The PDF for {subject} is not available yet.")
    
    return render_template('view_pdf.html', 
                          year=year, 
                          branch=branch, 
                          subject=subject)

@app.route('/download/<year>/<branch>/<subject>')
def download_pdf(year, branch, subject):
    # Check if the course exists
    if (year not in course_structure or 
        branch not in course_structure[year] or 
        subject not in course_structure[year][branch]):
        return abort(404)
    
    # Get file path
    pdf_path = get_pdf_path(year, branch, subject)
    logger.debug(f"Attempting to download file: {pdf_path}")
    
    # Check if file exists
    if not os.path.isfile(pdf_path):
        logger.warning(f"PDF not found: {pdf_path}")
        return render_template('error.html', 
                              message=f"The PDF for {subject} is not available for download.")
    
    try:
        # Use send_file which is more reliable than send_from_directory
        return send_file(pdf_path, 
                        as_attachment=True, 
                        download_name=f"{subject}.pdf")
    except Exception as e:
        logger.error(f"Error sending file: {e}")
        return render_template('error.html', 
                              message=f"Error downloading the file: {str(e)}")

@app.route('/admin')
def admin_panel():
    missing_files = []
    available_files = []
    
    for year in course_structure:
        for branch in course_structure[year]:
            for subject in course_structure[year][branch]:
                pdf_path = get_pdf_path(year, branch, subject)
                if os.path.isfile(pdf_path):
                    file_size = os.path.getsize(pdf_path)
                    available_files.append({
                        'year': year,
                        'branch': branch,
                        'subject': subject,
                        'path': pdf_path,
                        'size': f"{file_size / 1024:.1f} KB"
                    })
                else:
                    missing_files.append({
                        'year': year,
                        'branch': branch,
                        'subject': subject,
                        'path': pdf_path
                    })
    
    return render_template('admin.html', 
                          missing_files=missing_files, 
                          available_files=available_files)

@app.route('/sample')
def create_sample():
    """Create a sample PDF for testing purposes"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        year = "1"
        branch = "CMPN"
        subject = "Physics"
        
        directory = os.path.join('ebooks', year, branch.lower())
        os.makedirs(directory, exist_ok=True)
        
        pdf_path = get_pdf_path(year, branch, subject)
        
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.setFont("Helvetica", 16)
        c.drawString(100, 750, f"Sample {subject} PDF")
        c.setFont("Helvetica", 12)
        c.drawString(100, 730, "This is a sample PDF created for testing")
        c.drawString(100, 710, f"Year: {year}, Branch: {branch}")
        c.save()
        
        logger.info(f"Created sample PDF at {pdf_path}")
        return redirect(url_for('admin_panel'))
    except ImportError:
        return render_template('error.html', 
                              message="Could not create sample PDF. ReportLab library is not installed.")
    except Exception as e:
        logger.error(f"Error creating sample PDF: {e}")
        return render_template('error.html', 
                              message=f"Error creating sample PDF: {str(e)}")

if __name__ == '__main__':
    # Setup the directory structure
    setup_directories()
    
    # Run the app
    app.run(debug=True, port=5000)