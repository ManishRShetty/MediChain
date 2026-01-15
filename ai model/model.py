import os
import re
import json
import spacy
import nltk
import numpy as np
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
from PyPDF2 import PdfReader
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict
from scipy import stats
from spacy.matcher import Matcher

# Download NLTK resources
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Initialize NLP
nlp = spacy.load("en_core_web_sm", disable=["parser"])
nlp.add_pipe("sentencizer")
matcher = Matcher(nlp.vocab)  # Initialize Matcher

# Medical parameters to track
MEDICAL_PARAMS = [
    'glucose_fasting', 'hba1c', 'systolic_bp', 'diastolic_bp',
    'cholesterol', 'triglycerides', 'hdl', 'ldl'
]

# Initialize session state
if 'existing_reports' not in st.session_state:
    st.session_state.existing_reports = []
if 'processed_reports' not in st.session_state:
    st.session_state.processed_reports = []
    
# Add database reset on first run
if 'first_run' not in st.session_state:
    st.session_state.first_run = True
    # Clear database and JSON file
    st.session_state.existing_reports = []
    try:
        with open("medical_reports.json", "w") as f:
            json.dump([], f)
    except:
        pass

# Set page config
st.set_page_config(
    page_title="Medical Report Bias Analyzer",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main {
        padding: 2rem;
    }
    .report-card {
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
        background-color: #f8f9fc;
        border-left: 4px solid #4e73df;
    }
    .deviated {
        border-left: 4px solid #e74a3b !important;
    }
    .normal {
        border-left: 4px solid #1cc88a !important;
    }
    .header-card {
        background: linear-gradient(45deg, #4e73df, #224abe);
        color: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .param-card {
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 1rem;
        background-color: white;
    }
    .stProgress > div > div > div > div {
        background-color: #4e73df;
    }
    .stButton>button {
        background-color: #4e73df;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.35rem;
        font-size: 1rem;
    }
    .stButton>button:hover {
        background-color: #2e59d9;
        color: white;
    }
    .metric-card {
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: white;
        text-align: center;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper functions
def extract_text_from_file(uploaded_file):
    """Extract text from PDF or TXT files"""
    text = ""
    try:
        if uploaded_file.type == "application/pdf":
            reader = PdfReader(uploaded_file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        elif uploaded_file.type == "text/plain":
            text = uploaded_file.getvalue().decode("utf-8")
    except Exception as e:
        st.error(f"Error reading {uploaded_file.name}: {str(e)}")
    return text

def extract_age_nlp(text):
    """Extract age from text using NLP"""
    doc = nlp(text)
    
    # Custom patterns
    age_patterns = [
        [{"LOWER": "age"}, {"IS_PUNCT": True, "OP": "?"}, {"LIKE_NUM": True}],
        [{"LOWER": "patient"}, {"LOWER": "age"}, {"IS_PUNCT": True, "OP": "?"}, {"LIKE_NUM": True}],
        [{"LIKE_NUM": True}, {"LOWER": {"IN": ["years", "yrs"]}}, {"LOWER": "old", "OP": "?"}],
        [{"LOWER": "dob"}, {"IS_PUNCT": True}, {"TEXT": {"REGEX": r"\d{1,2}/\d{1,2}/(\d{4})"}}]
    ]
    
    matcher.add("AGE_PATTERNS", age_patterns)
    
    matches = matcher(doc)
    for match_id, start, end in matches:
        span = doc[start:end]
        if nlp.vocab.strings[match_id] == "AGE_PATTERNS":
            for token in span:
                if token.like_num:
                    if "dob" in span.text.lower():
                        birth_year = int(re.search(r"\d{4}", span.text).group())
                        return datetime.now().year - birth_year
                    return int(token.text)
    
    # Enhanced NER
    for ent in doc.ents:
        if ent.label_ == "AGE" or (ent.label_ == "CARDINAL" and 1 <= int(ent.text) <= 120):
            try:
                return int(ent.text)
            except:
                continue
    
    return None

def classify_age_group(age):
    """Classify age into groups"""
    if age is None:
        return "Unknown"
    if age < 20:
        return "Below 20"
    elif 20 <= age <= 60:
        return "20 to 60"
    else:
        return "Above 60"

def extract_medical_parameters(text):
    """Extract medical parameters from text"""
    params = {
        "glucose_fasting": extract_value(text, r'fasting glucose:?\s*(\d+(\.\d+)?)\s*(mg/dL)?'),
        "hba1c": extract_value(text, r'HbA1c:?\s*(\d+(\.\d+)?)\s*%?'),
        "systolic_bp": extract_value(text, r'blood pressure:?\s*(\d+)/\d+'),
        "diastolic_bp": extract_value(text, r'blood pressure:?\s*\d+/(\d+)'),
        "cholesterol": extract_value(text, r'total cholesterol:?\s*(\d+(\.\d+)?)\s*(mg/dL)?'),
        "triglycerides": extract_value(text, r'triglycerides:?\s*(\d+(\.\d+)?)\s*(mg/dL)?'),
        "hdl": extract_value(text, r'HDL:?\s*(\d+(\.\d+)?)\s*(mg/dL)?'),
        "ldl": extract_value(text, r'LDL:?\s*(\d+(\.\d+)?)\s*(mg/dL)?'),
    }
    
    # Convert to float if possible, else None
    for key, value in params.items():
        if value is not None:
            try:
                params[key] = float(value)
            except (ValueError, TypeError):
                params[key] = None
        else:
            params[key] = None
                
    return params

def extract_value(text, pattern):
    """Extract value using regex"""
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(1) if match else None

def detect_bias(new_report, existing_reports):
    """Detect bias by comparing new report with existing reports in same age group"""
    age_group = classify_age_group(new_report['age'])
    group_reports = [r for r in existing_reports if classify_age_group(r['age']) == age_group]
    
    compared_with = len(group_reports)  # Always calculate this value
    
    if not group_reports:
        return {
            "bias_score": 0, 
            "deviations": [],
            "age_group": age_group,
            "compared_with": compared_with
        }
    
    deviations = []
    
    for param in MEDICAL_PARAMS:
        if param in new_report and new_report[param] is not None:
            # Get values from existing reports
            existing_vals = [r[param] for r in group_reports if param in r and r[param] is not None]
            
            if len(existing_vals) > 5:  # Need enough samples for stats
                # Calculate statistical metrics
                mean = np.mean(existing_vals)
                std = np.std(existing_vals)
                
                if std > 0:  # Avoid division by zero
                    z_score = (new_report[param] - mean) / std
                    
                    # Flag significant deviations (>2σ)
                    if abs(z_score) > 2:
                        deviations.append({
                            "parameter": param,
                            "new_value": new_report[param],
                            "group_mean": round(mean, 2),
                            "z_score": round(z_score, 2),
                            "unit": get_param_unit(param)
                        })
    
    # Calculate overall bias score
    bias_score = len(deviations) / len(MEDICAL_PARAMS) if MEDICAL_PARAMS else 0
    
    return {
        "bias_score": round(bias_score, 2),
        "deviations": deviations,
        "age_group": age_group,
        "compared_with": compared_with
    }

def get_param_unit(param):
    """Get unit for medical parameter"""
    units = {
        'glucose_fasting': 'mg/dL',
        'hba1c': '%',
        'systolic_bp': 'mmHg',
        'diastolic_bp': 'mmHg',
        'cholesterol': 'mg/dL',
        'triglycerides': 'mg/dL',
        'hdl': 'mg/dL',
        'ldl': 'mg/dL'
    }
    return units.get(param, '')

def save_reports(reports, filename="medical_reports.json"):
    """Save reports to JSON file with error handling"""
    try:
        with open(filename, 'w') as f:
            json.dump(reports, f, indent=2)
    except (IOError, TypeError) as e:
        st.error(f"Error saving reports: {str(e)}")

def load_reports(filename="medical_reports.json"):
    """Load reports from JSON file with error handling"""
    try:
        # Check if file exists and has content
        if os.path.exists(filename):
            if os.path.getsize(filename) > 0:
                with open(filename, 'r') as f:
                    return json.load(f)
            else:
                # File exists but is empty
                return []
        else:
            # File doesn't exist - create it
            with open(filename, 'w') as f:
                json.dump([], f)
            return []
    except (json.JSONDecodeError, IOError) as e:
        st.error(f"Error loading reports: {str(e)}. Creating new database.")
        # Create a valid empty JSON file
        with open(filename, 'w') as f:
            json.dump([], f)
        return []

def plot_parameter_comparison(reports):
    """Generate comparison plot for medical parameters"""
    if not reports:
        return None
    
    # Prepare data
    data = []
    for report in reports:
        age_group = classify_age_group(report.get('age'))
        for param in MEDICAL_PARAMS:
            if param in report and report[param] is not None:
                data.append({
                    "Parameter": param.replace('_', ' ').title(),
                    "Value": report[param],
                    "Age Group": age_group
                })
    
    if not data:
        return None
    
    df = pd.DataFrame(data)
    
    # Create plot
    plt.figure(figsize=(12, 8))
    sns.boxplot(x="Parameter", y="Value", hue="Age Group", data=df, palette="Set2")
    plt.title("Medical Parameter Distribution by Age Group")
    plt.xticks(rotation=45)
    plt.tight_layout()
    
    return plt

def display_report_summary(report):
    """Display summary of a single report"""
    with st.container():
        col1, col2 = st.columns([1, 3])
        with col1:
            age = report.get('age', 'Unknown')
            st.metric("Patient Age", f"{age} years" if age != 'Unknown' else "Unknown")
            st.metric("Age Group", report.get('age_group', 'Unknown'))
            
        with col2:
            params = st.columns(4)
            for i, param in enumerate(MEDICAL_PARAMS[:4]):
                with params[i]:
                    if param in report and report[param] is not None:
                        st.metric(
                            label=param.replace('_', ' ').title(),
                            value=f"{report[param]} {get_param_unit(param)}"
                        )
                    else:
                        st.metric(
                            label=param.replace('_', ' ').title(),
                            value="N/A"
                        )
            
            params = st.columns(4)
            for i, param in enumerate(MEDICAL_PARAMS[4:]):
                with params[i]:
                    if param in report and report[param] is not None:
                        st.metric(
                            label=param.replace('_', ' ').title(),
                            value=f"{report[param]} {get_param_unit(param)}"
                        )
                    else:
                        st.metric(
                            label=param.replace('_', ' ').title(),
                            value="N/A"
                        )

# Streamlit UI
st.title("🏥 Medical Report Bias Analyzer")
st.markdown("""
Upload medical reports to detect potential biases by comparing against existing reports in the same age group.
The system analyzes key health parameters and flags significant deviations.
""")

# Load existing reports
st.session_state.existing_reports = load_reports()

# File upload section
st.header("📤 Upload Medical Reports")
uploaded_files = st.file_uploader(
    "Select medical reports (PDF or TXT)",
    type=["pdf", "txt"],
    accept_multiple_files=True
)

# Processing
if uploaded_files:
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    # Reset processed reports for this session
    st.session_state.processed_reports = []
    
    for i, uploaded_file in enumerate(uploaded_files):
        status_text.text(f"Processing {i+1}/{len(uploaded_files)}: {uploaded_file.name}")
        progress_bar.progress((i + 1) / len(uploaded_files))
        
        try:
            # Extract text
            text = extract_text_from_file(uploaded_file)
            
            # Extract medical data
            age = extract_age_nlp(text)
            medical_data = extract_medical_parameters(text)
            
            report_data = {
                "filename": uploaded_file.name,
                "age": age,
                "age_group": classify_age_group(age),
                "text": text[:5000] + "..." if len(text) > 5000 else text,
                **medical_data
            }
            
            # Detect bias
            bias_result = detect_bias(report_data, st.session_state.existing_reports)
            report_data["bias_analysis"] = bias_result
            
            # Store results
            st.session_state.processed_reports.append(report_data)
            
            # Add to existing reports
            st.session_state.existing_reports.append(report_data)
            
        except Exception as e:
            st.error(f"Error processing {uploaded_file.name}: {str(e)}")
    
    # Save updated reports
    save_reports(st.session_state.existing_reports)
    status_text.text("Processing complete!")
    progress_bar.empty()
    st.success(f"✅ Processed {len(uploaded_files)} report(s)")
    
    # Display results
    st.header("📊 Analysis Results")
    
    # Overall statistics
    if st.session_state.processed_reports:
        bias_scores = [r.get('bias_analysis', {}).get('bias_score', 0) 
                      for r in st.session_state.processed_reports]
        avg_bias = np.mean(bias_scores) if bias_scores else 0
        
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Reports Processed", len(st.session_state.processed_reports))
        col2.metric("Average Bias Score", f"{avg_bias:.2f}/1.0")
        col3.metric("Total Reports in Database", len(st.session_state.existing_reports))
    
    # Individual report results
    for report in st.session_state.processed_reports:
        bias_analysis = report.get('bias_analysis', {})
        bias_score = bias_analysis.get('bias_score', 0)
        deviations = bias_analysis.get('deviations', [])
        compared_with = bias_analysis.get('compared_with', 0)
        
        # Card styling based on bias
        card_class = "deviated" if deviations else "normal"
        
        with st.container():
            st.markdown(f"<div class='report-card {card_class}'>", unsafe_allow_html=True)
            
            st.subheader(f"📄 {report.get('filename', 'Unknown File')}")
            
            # Report summary
            display_report_summary(report)
            
            # Bias analysis
            st.subheader("Bias Detection")
            col1, col2 = st.columns(2)
            col1.metric("Bias Score", f"{bias_score}/1.0")
            col2.metric("Compared With", f"{compared_with} reports")
            
            if deviations:
                st.error("⚠️ Significant deviations detected:")
                for dev in deviations:
                    st.markdown(f"""
                    - **{dev.get('parameter', 'Unknown').replace('_', ' ').title()}**: 
                      {dev.get('new_value', 'N/A')} {dev.get('unit', '')} 
                      (Group avg: {dev.get('group_mean', 'N/A')} {dev.get('unit', '')}, 
                      Z-score: {dev.get('z_score', 'N/A'):.2f})
                    """)
            else:
                st.success("✅ No significant deviations found")
                
            st.markdown("</div>", unsafe_allow_html=True)
    
    # Visualization
    st.header("📈 Parameter Comparison")
    fig = plot_parameter_comparison(st.session_state.existing_reports)
    if fig:
        st.pyplot(fig)
    else:
        st.warning("Not enough data to generate visualizations")
    
    # Show raw data
    if st.checkbox("Show raw data"):
        st.subheader("Current Session Reports")
        st.dataframe(pd.DataFrame(st.session_state.processed_reports))
        
        st.subheader("All Reports in Database")
        st.dataframe(pd.DataFrame(st.session_state.existing_reports))
else:
    st.info("ℹ️ Please upload medical reports to begin analysis")

# Sidebar info
st.sidebar.header("About")
st.sidebar.info("""
This system analyzes medical reports for potential biases by:
1. Extracting key health parameters
2. Grouping reports by age categories
3. Comparing new reports against existing data
4. Flagging statistically significant deviations
""")

st.sidebar.header("Parameters Tracked")
for param in MEDICAL_PARAMS:
    st.sidebar.markdown(f"- {param.replace('_', ' ').title()}")

st.sidebar.header("Database Status")
st.sidebar.metric("Total Reports", len(st.session_state.existing_reports))

if st.sidebar.button("Clear Database"):
    st.session_state.existing_reports = []
    save_reports([])
    st.sidebar.success("Database cleared!")
    # Also clear processed reports for this session
    st.session_state.processed_reports = []