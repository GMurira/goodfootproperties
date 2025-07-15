const getDashboardStats = async (req, res) => {
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
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
};
