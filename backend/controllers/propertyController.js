const Property = require('../models/Property');

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const { city, propertyType, status, minPrice, maxPrice, bedrooms } = req.query;
    
    let query = { isActive: true };

    if (city) query['address.city'] = new RegExp(city, 'i');
    if (propertyType) query.propertyType = propertyType;
    if (status) query.status = status;
    if (bedrooms) query['features.bedrooms'] = parseInt(bedrooms);
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const properties = await Property.find(query)
      .select('title price propertyType status address features images isFeatured owner')
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
exports.createProperty = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Make sure user is property owner or admin
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, isActive: true })
      .select('title price propertyType status address features images owner')
      .populate('owner', 'name email')
      .limit(6)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
