const database = require('../models/database');
const path = require('path');
const fs = require('fs').promises;

class PropertyController {
  // Get all properties (public endpoint)
  async getAllProperties(req, res) {
    try {
      const { category, status = 'available' } = req.query;
      
      let query = 'SELECT * FROM properties WHERE status = ?';
      let params = [status];
      
      if (category && ['lands', 'cars', 'apartments'].includes(category)) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const properties = await database.query(query, params);
      
      res.json({
        success: true,
        data: properties,
        count: properties.length
      });
      
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        error: 'Failed to fetch properties',
        message: 'An error occurred while fetching properties'
      });
    }
  }

  // Get properties by category (public endpoint)
  async getPropertiesByCategory(req, res) {
    try {
      const { category } = req.params;
      
      if (!['lands', 'cars', 'apartments'].includes(category)) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Category must be one of: lands, cars, apartments'
        });
      }
      
      const properties = await database.query(
        'SELECT * FROM properties WHERE category = ? AND status = ? ORDER BY created_at DESC',
        [category, 'available']
      );
      
      res.json({
        success: true,
        category,
        data: properties,
        count: properties.length
      });
      
    } catch (error) {
      console.error('Get properties by category error:', error);
      res.status(500).json({
        error: 'Failed to fetch properties',
        message: 'An error occurred while fetching properties'
      });
    }
  }

  // Get single property (public endpoint)
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      
      const property = await database.get(
        'SELECT * FROM properties WHERE id = ?',
        [id]
      );
      
      if (!property) {
        return res.status(404).json({
          error: 'Property not found',
          message: 'The requested property does not exist'
        });
      }
      
      res.json({
        success: true,
        data: property
      });
      
    } catch (error) {
      console.error('Get property by ID error:', error);
      res.status(500).json({
        error: 'Failed to fetch property',
        message: 'An error occurred while fetching the property'
      });
    }
  }

  // Add new property (admin only)
  async addProperty(req, res) {
    try {
      const {
        title,
        description,
        price,
        location,
        category,
        features,
        size,
        status = 'available'
      } = req.body;

      // Validate required fields
      if (!title || !price || !location || !category) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Title, price, location, and category are required'
        });
      }

      // Validate category
      if (!['lands', 'cars', 'apartments'].includes(category)) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Category must be one of: lands, cars, apartments'
        });
      }

      // Handle image upload
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${category}/${req.file.filename}`;
      }

      // Insert property
      const result = await database.run(
        `INSERT INTO properties 
         (title, description, price, location, category, image_url, features, size, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, price, location, category, imageUrl, features, size, status]
      );

      // Get the created property
      const newProperty = await database.get(
        'SELECT * FROM properties WHERE id = ?',
        [result.id]
      );

      res.status(201).json({
        success: true,
        message: 'Property added successfully',
        data: newProperty
      });

    } catch (error) {
      console.error('Add property error:', error);
      res.status(500).json({
        error: 'Failed to add property',
        message: 'An error occurred while adding the property'
      });
    }
  }

  // Update property (admin only)
  async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        price,
        location,
        category,
        features,
        size,
        status
      } = req.body;

      // Check if property exists
      const existingProperty = await database.get(
        'SELECT * FROM properties WHERE id = ?',
        [id]
      );

      if (!existingProperty) {
        return res.status(404).json({
          error: 'Property not found',
          message: 'The property you want to update does not exist'
        });
      }

      // Validate category if provided
      if (category && !['lands', 'cars', 'apartments'].includes(category)) {
        return res.status(400).json({
          error: 'Invalid category',
          message: 'Category must be one of: lands, cars, apartments'
        });
      }

      // Handle image upload
      let imageUrl = existingProperty.image_url;
      if (req.file) {
        // Delete old image if exists
        if (existingProperty.image_url) {
          try {
            const oldImagePath = path.join(__dirname, '../../', existingProperty.image_url);
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.log('Could not delete old image:', err.message);
          }
        }
        imageUrl = `/uploads/${category || existingProperty.category}/${req.file.filename}`;
      }

      // Update property
      await database.run(
        `UPDATE properties SET 
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         location = COALESCE(?, location),
         category = COALESCE(?, category),
         image_url = COALESCE(?, image_url),
         features = COALESCE(?, features),
         size = COALESCE(?, size),
         status = COALESCE(?, status),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, description, price, location, category, imageUrl, features, size, status, id]
      );

      // Get updated property
      const updatedProperty = await database.get(
        'SELECT * FROM properties WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Property updated successfully',
        data: updatedProperty
      });

    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({
        error: 'Failed to update property',
        message: 'An error occurred while updating the property'
      });
    }
  }

  // Delete property (admin only)
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;

      // Check if property exists
      const property = await database.get(
        'SELECT * FROM properties WHERE id = ?',
        [id]
      );

      if (!property) {
        return res.status(404).json({
          error: 'Property not found',
          message: 'The property you want to delete does not exist'
        });
      }

      // Delete image file if exists
      if (property.image_url) {
        try {
          const imagePath = path.join(__dirname, '../../', property.image_url);
          await fs.unlink(imagePath);
        } catch (err) {
          console.log('Could not delete image file:', err.message);
        }
      }

      // Delete property from database
      await database.run('DELETE FROM properties WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Property deleted successfully'
      });

    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        error: 'Failed to delete property',
        message: 'An error occurred while deleting the property'
      });
    }
  }

  // Get admin dashboard stats

  async getDashboardStats(req, res) {
    try {
      const [
        totalProperties,
        landsCount,
        carsCount,
        apartmentsCount,
        availableCount,
        soldCount,
        unreadMessages
      ] = await Promise.all([
        database.get('SELECT COUNT(*) as count FROM properties'),
        database.get('SELECT COUNT(*) as count FROM properties WHERE category = "lands"'),
        database.get('SELECT COUNT(*) as count FROM properties WHERE category = "cars"'),
        database.get('SELECT COUNT(*) as count FROM properties WHERE category = "apartments"'),
        database.get('SELECT COUNT(*) as count FROM properties WHERE status = "available"'),
        database.get('SELECT COUNT(*) as count FROM properties WHERE status = "sold"'),
        database.get('SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"')
      ]);

      res.json({
        success: true,
        data: {
          total: totalProperties.count,
          propertiesByCategory: {
            lands: landsCount.count,
            cars: carsCount.count,
            apartments: apartmentsCount.count
          },
          propertiesByStatus: {
            available: availableCount.count,
            sold: soldCount.count
          },
          messages: unreadMessages.count
        }
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard stats'
      });
    }
  }

}

module.exports = new PropertyController();
