import React, { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

function App() {

  // Set API_BASE_URL environment
  const API_BASE_URL = "http://localhost:5030"

  const formFields = {
    'id': '',
    'name': '',
    'type': '',
    'stock': '',
    'price': '',
  }

  // Initialize States
  const [fruits, setFruits] = useState([]) // Initialize Fruits Data State
  const [showForm, setShowForm] = useState(false) // Initialize Show Form (Add/Edit) State -> default state 'false'
  const [editMode, setEditMode] = useState(false) // Initialize Edit Mode State -> default state 'false'
  const [loading, setLoading] = useState(false) // Initialize Loading State -> default state 'false'
  const [saving, setSaving] = useState(false) // Initialize Saving State -> default state 'false'
  const [formData, setFormData] = useState(formFields) // Initialize formFields

  // useRef for Form Fields
  const formRef = useRef(null)

  // Render Events using useEffect

  // Mount initial components for Data
  useEffect(() => {
    loadFruits();
  }, [])

  // Set preventDefault Scroll
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [showForm]) // Renders when showForm changes event

  // API CALLBACKS

  const loadFruits = useCallback(async () => {
    setLoading(true); //set loading state -> 'true'

    try {
      const response = await fetch(`${API_BASE_URL}/fruits-inventories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error('Network response was not successful')
      }

      const raw = await response.json()

      setFruits(raw.data)

    } catch (error) {
      console.error('Error fetching data: ', error)
      alert('Failed to load data, please check your connection running in the server')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFruitByID = useCallback(async (id) => {
    try {

      const response = await fetch(`${API_BASE_URL}/edit-fruits-inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: id })
      })

      if (!response.ok) {
        throw new Error('Network response was not successful')
      }

      const raw = await response.json()

      const formEditFields = raw.data[0];

      setFormData({
        id: formEditFields.ID,
        name: formEditFields.NAME,
        type: formEditFields.TYPE,
        stock: formEditFields.STOCK,
        price: formEditFields.PRICE
      })

    } catch (error) {
      console.error('Error fetching data: ', error)
      alert('Failed to load [FRUITS] data')
    }
  }, [])

  const handleAdd = async () => {
    setFormData({
      id: '',
      name: '',
      type: '',
      stock: '',
      price: ''
    })
    setShowForm(true) // Show Edit Form
    setEditMode(false) // Set Data Edit Mode -> false
  }

  const handleEdit = async (id) => {
    setShowForm(true) //Show Edit Form
    setEditMode(true) // Set Data Edit Mode -> true
    await fetchFruitByID(id)
  }

  const handleSave = async () => {
    const {
      id,
      name,
      type,
      stock,
      price
    } = formData

    // Validation Inputs
    if (!name || !type || !stock || !price) {
      alert('Please fill in all fields')
      return
    }

    const stockNo = parseInt(stock);
    const priceNo = parseInt(price)

    if (isNaN(stockNo) || isNaN(priceNo)) {
      alert('Please enter valid number for stock and price')
      return
    }

    setSaving(true)

    try {
      let url, bodyData;

      if (id) {
        url = `${API_BASE_URL}/update-fruits-inventory`;

        bodyData = JSON.stringify({
          id: parseInt(id),
          name,
          type,
          stock: stockNo,
          price: priceNo
        })

        console.log('Updating data')
      } else {
        url = `${API_BASE_URL}/add-fruits-inventory`;

        bodyData = JSON.stringify({
          id: parseInt(id),
          name,
          type,
          stock: stockNo,
          price: priceNo
        })

        console.log('Adding data')
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: bodyData
      })

      if (!response.ok) {
        throw new Error('Network response was not successful')
      }

      const data = await response.json();

      console.log('Saved', data)

      alert(id ? 'Updated Successfully' : 'Added Successfully')

      setShowForm(false)
      setSaving(false)

      await loadFruits(); // re-render state data

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })

    } catch (error) {
      console.error('Error adding data: ', error)
      alert('Failed to add [FRUITS] data')
    }
  }

  const onChangeHandler = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('fruit-', '')]: value
    }))
  }

  const handleCancel = () => {
    setShowForm(false) // Hide Form
  }

  if (loading && fruits.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Loading data</h3>
      </div>
    )
  }

  return (
    <div>
      {
        // console.log(fruits)
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              fruits.length > 0 ? (
                fruits.map((rows) => (
                  <tr key={rows.ID}>
                    <td>{rows.ID}</td>
                    <td>{rows.NAME}</td>
                    <td>{rows.TYPE}</td>
                    <td>{rows.STOCK}</td>
                    <td>₱ {parseFloat(rows.PRICE).toFixed(2)}</td>
                    <td>
                      <button className='edit-btn' onClick={() => handleEdit(rows.ID)}>Edit</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                    No records found
                  </td>
                </tr>
              )
            }

          </tbody>
        </table>

      }

      <button id="addFruitBtn" onClick={() => handleAdd()}>Add Fruit</button>

      {
        showForm && (
          <div id="edit-form" ref={formRef} style={{ display: 'block' }}>
            <h3 id="edit-title">{editMode ? "Edit Fruit" : "Add Fruit"}</h3>
            <input type="hidden" value={formData.id} />
            <label htmlFor="fruit-name">Name:</label>
            <input type="text" id="fruit-name" name="fruit-name" value={formData.name} onChange={onChangeHandler} /><br /><br />
            <label htmlFor="fruit-type">Type:</label>
            <input type="text" id="fruit-type" name="fruit-type" value={formData.type} onChange={onChangeHandler} /><br /><br />
            <label htmlFor="fruit-stock">Stock:</label>
            <input type="number" id="fruit-stock" name="fruit-stock" value={formData.stock} onChange={onChangeHandler} /><br /><br />
            <label htmlFor="fruit-price">Price:</label>
            <input type="number" step="0.01" id="fruit-price" name="fruit-price" value={formData.price} onChange={onChangeHandler} /><br /><br />

            <div className="form-buttons">
              <button id="saveBtn" onClick={handleSave} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
              <button id="cancelBtn" onClick={handleCancel} disabled={saving}>CANCEL</button>
            </div>
          </div>
        )
      }
    </div>

  )
}

export default App
