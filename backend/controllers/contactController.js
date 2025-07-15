const database = require('../models/database');

// Submit contact message (public endpoint)
const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Insert message
    const result = await database.run(
      'INSERT INTO contact_messages (name, email, phone, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, message, 'unread', new Date().toISOString()]
    );

    res.json({
      success: true,
      message: 'Message sent successfully',
      id: result.lastID
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Get all messages (admin endpoint)
const getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM contact_messages';
    let countQuery = 'SELECT COUNT(*) as count FROM contact_messages';
    let params = [];
    let countParams = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [messages, countResult] = await Promise.all([
      database.query(query, params),
      database.get(countQuery, countParams)
    ]);

    const totalMessages = countResult.count;
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages'
    });
  }
};

// Get message by ID (admin endpoint)
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await database.get(
      'SELECT * FROM contact_messages WHERE id = ?',
      [id]
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Get message by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message'
    });
  }
};

// Update message status (admin endpoint)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['unread', 'read', 'replied'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: unread, read, or replied'
      });
    }

    // Check if message exists
    const existingMessage = await database.get(
      'SELECT id FROM contact_messages WHERE id = ?',
      [id]
    );

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update status
    await database.run(
      'UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), id]
    );

    res.json({
      success: true,
      message: 'Message status updated successfully'
    });

  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
};

// Delete message (admin endpoint)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const message = await database.get(
      'SELECT id FROM contact_messages WHERE id = ?',
      [id]
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Delete message
    await database.run('DELETE FROM contact_messages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Get contact statistics (admin endpoint)
const getContactStats = async (req, res) => {
  try {
    const [
      totalMessages,
      unreadMessages,
      readMessages,
      repliedMessages
    ] = await Promise.all([
      database.get('SELECT COUNT(*) as count FROM contact_messages'),
      database.get('SELECT COUNT(*) as count FROM contact_messages WHERE status = "unread"'),
      database.get('SELECT COUNT(*) as count FROM contact_messages WHERE status = "read"'),
      database.get('SELECT COUNT(*) as count FROM contact_messages WHERE status = "replied"')
    ]);

    res.json({
      success: true,
      data: {
        totalMessages: totalMessages.count,
        messagesByStatus: {
        unread: unreadMessages.count,
        read: readMessages.count,
        replied: repliedMessages.count
        }
      }
    });

  } catch (error) {
    console.error('Contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact stats'
    });
  }
};

module.exports = {
  submitMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  deleteMessage,
  getContactStats
};
