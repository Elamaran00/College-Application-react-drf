import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8000/colleges";

function App() {
  const [colleges, setColleges] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showCollegeForm, setShowCollegeForm] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("colleges"); // 'colleges' or 'enquiries' or 'manage'
  const [collegeFormData, setCollegeFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [enquiryFormData, setEnquiryFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    course: "Engineering",
  });
  const [editingCollege, setEditingCollege] = useState(null);

  // Fetch colleges on load
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await axios.get(`${API_URL}/colleges/`);
      setColleges(response.data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await axios.get(`${API_URL}/enquiries/`);
      setEnquiries(response.data);
    } catch (error) {
      alert("Login required to view enquiries");
    }
  };

  // ========== USER FUNCTIONS ==========
  const handleEnquiryClick = (college) => {
    setSelectedCollege(college);
    setShowEnquiryForm(true);
  };

  const handleEnquiryInputChange = (e) => {
    setEnquiryFormData({
      ...enquiryFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitEnquiry = async (e) => {
    e.preventDefault();

    try {
      const enquiryData = {
        ...enquiryFormData,
        college: selectedCollege.id,
      };

      await axios.post(`${API_URL}/enquiries/`, enquiryData);
      alert("Enquiry submitted successfully!");
      setShowEnquiryForm(false);
      setEnquiryFormData({
        name: "",
        email: "",
        mobile: "",
        course: "Engineering",
      });

      // Refresh enquiries if admin is logged in
      if (isAdmin) {
        fetchEnquiries();
      }
    } catch (error) {
      alert("Error submitting enquiry");
      console.error(error);
    }
  };

  // ========== ADMIN FUNCTIONS ==========
  const handleAdminLogin = () => {
    const username = prompt("Enter username:");
    const password = prompt("Enter password:");

    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      fetchEnquiries();
      alert("Admin login successful!");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setActiveTab("colleges");
    setEnquiries([]);
  };

  // College CRUD Operations
  const handleCollegeInputChange = (e) => {
    setCollegeFormData({
      ...collegeFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCollege = () => {
    setEditingCollege(null);
    setCollegeFormData({ name: "", location: "", description: "" });
    setShowCollegeForm(true);
  };

  const handleEditCollege = (college) => {
    setEditingCollege(college);
    setCollegeFormData({
      name: college.name,
      location: college.location,
      description: college.description,
    });
    setShowCollegeForm(true);
  };

  const handleDeleteCollege = async (collegeId) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      try {
        await axios.delete(`${API_URL}/colleges/${collegeId}/`);
        alert("College deleted successfully!");
        fetchColleges();
      } catch (error) {
        alert("Error deleting college");
        console.error(error);
      }
    }
  };

  const handleSubmitCollege = async (e) => {
    e.preventDefault();

    try {
      if (editingCollege) {
        // Update existing college
        await axios.put(
          `${API_URL}/colleges/${editingCollege.id}/`,
          collegeFormData
        );
        alert("College updated successfully!");
      } else {
        // Create new college
        await axios.post(`${API_URL}/colleges/`, collegeFormData);
        alert("College added successfully!");
      }

      setShowCollegeForm(false);
      setCollegeFormData({ name: "", location: "", description: "" });
      setEditingCollege(null);
      fetchColleges();
    } catch (error) {
      alert(`Error ${editingCollege ? "updating" : "adding"} college`);
      console.error(error);
    }
  };

  // Filter enquiries by college
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState("all");

  const filteredEnquiries =
    selectedCollegeFilter === "all"
      ? enquiries
      : enquiries.filter((enquiry) => enquiry.college == selectedCollegeFilter);

  return (
    <div className="app">
      <header className="header">
        <h1>College Directory</h1>
        <div className="admin-section">
          {isAdmin ? (
            <>
              <span>Admin Mode</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleAdminLogin} className="login-btn">
              Admin Login
            </button>
          )}
        </div>
      </header>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "colleges" ? "active" : ""}`}
            onClick={() => setActiveTab("colleges")}
          >
            View Colleges
          </button>
          <button
            className={`tab-btn ${activeTab === "manage" ? "active" : ""}`}
            onClick={() => setActiveTab("manage")}
          >
            Manage Colleges
          </button>
          <button
            className={`tab-btn ${activeTab === "enquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("enquiries")}
          >
            View Enquiries
          </button>
        </div>
      )}

      <main className="main-content">
        {/* ========== VIEW COLLEGES TAB (Visible to all users) ========== */}
        {(activeTab === "colleges" || !isAdmin) && (
          <section className="colleges-section">
            <h2>Available Colleges</h2>
            {isAdmin && (
              <div className="admin-actions">
                <button onClick={handleAddCollege} className="add-btn">
                  + Add New College
                </button>
              </div>
            )}
            <div className="colleges-grid">
              {colleges.map((college) => (
                <div key={college.id} className="college-card">
                  <h3>{college.name}</h3>
                  <p className="location">{college.location}</p>
                  <p className="description">{college.description}</p>
                  <div className="card-actions">
                    <button
                      onClick={() => handleEnquiryClick(college)}
                      className="enquire-btn"
                    >
                      Enquire Now
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditCollege(college)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========== MANAGE COLLEGES TAB (Admin Only) ========== */}
        {isAdmin && activeTab === "manage" && (
          <section className="manage-section">
            <h2>Manage Colleges</h2>
            <button onClick={handleAddCollege} className="add-btn">
              + Add New College
            </button>

            <div className="colleges-list">
              <table className="manage-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr key={college.id}>
                      <td>{college.id}</td>
                      <td>{college.name}</td>
                      <td>{college.location}</td>
                      <td className="description-cell">
                        {college.description.length > 50
                          ? `${college.description.substring(0, 50)}...`
                          : college.description}
                      </td>
                      <td className="action-buttons">
                        <button
                          onClick={() => handleEditCollege(college)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCollege(college.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ========== ENQUIRIES TAB (Admin Only) ========== */}
        {isAdmin && activeTab === "enquiries" && (
          <section className="enquiries-section">
            <h2>Enquiries Management</h2>

            {/* Filter by College */}
            <div className="filter-section">
              <label>Filter by College: </label>
              <select
                value={selectedCollegeFilter}
                onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Colleges</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
              <span className="filter-count">
                Showing {filteredEnquiries.length} of {enquiries.length}{" "}
                enquiries
              </span>
            </div>

            {filteredEnquiries.length === 0 ? (
              <p className="no-data">No enquiries submitted yet.</p>
            ) : (
              <div className="enquiries-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Course</th>
                      <th>College</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map((enquiry) => (
                      <tr key={enquiry.id}>
                        <td>{enquiry.id}</td>
                        <td>{enquiry.name}</td>
                        <td>{enquiry.email}</td>
                        <td>{enquiry.mobile}</td>
                        <td>{enquiry.course}</td>
                        <td>
                          {colleges.find((c) => c.id === enquiry.college)
                            ?.name || "Unknown"}
                        </td>
                        <td>
                          {new Date(enquiry.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ========== MODALS ========== */}

        {/* Enquiry Form Modal */}
        {showEnquiryForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Enquire about {selectedCollege?.name}</h3>
              <form onSubmit={handleSubmitEnquiry}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  value={enquiryFormData.name}
                  onChange={handleEnquiryInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={enquiryFormData.email}
                  onChange={handleEnquiryInputChange}
                  required
                />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={enquiryFormData.mobile}
                  onChange={handleEnquiryInputChange}
                  required
                />
                <select
                  name="course"
                  value={enquiryFormData.course}
                  onChange={handleEnquiryInputChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Business Administration">
                    Business Administration
                  </option>
                  <option value="Medicine">Medicine</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
                <div className="modal-actions">
                  <button type="submit">Submit Enquiry</button>
                  <button
                    type="button"
                    onClick={() => setShowEnquiryForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* College Form Modal */}
        {showCollegeForm && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingCollege ? "Edit College" : "Add New College"}</h3>
              <form onSubmit={handleSubmitCollege}>
                <input
                  type="text"
                  name="name"
                  placeholder="College Name"
                  value={collegeFormData.name}
                  onChange={handleCollegeInputChange}
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location (e.g., City, State)"
                  value={collegeFormData.location}
                  onChange={handleCollegeInputChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={collegeFormData.description}
                  onChange={handleCollegeInputChange}
                  rows="4"
                  required
                />
                <div className="modal-actions">
                  <button type="submit">
                    {editingCollege ? "Update College" : "Add College"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCollegeForm(false);
                      setEditingCollege(null);
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
