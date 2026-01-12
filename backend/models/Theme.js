const mongoose = require('mongoose');

const ThemeSchema = new mongoose.Schema({
  selectedTheme: {
    type: String,
    required: true,
    enum: ['option1', 'option2', 'option3', 'option4', 'option5', 'option6', 'option7', 'option8', 'option9', 'option10', 'option11', 'option12', 'original'],
    default: 'option12' // Midnight + Gold
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: false // Make it optional for dev mode
  }
});

// Ensure only one theme document exists
ThemeSchema.statics.getTheme = async function() {
  let theme = await this.findOne();
  if (!theme) {
    theme = await this.create({ selectedTheme: 'option12' }); // Midnight + Gold
  }
  return theme;
};

ThemeSchema.statics.updateTheme = async function(selectedTheme, adminId) {
  let theme = await this.findOne();
  if (!theme) {
    // Only set updatedBy if adminId is a valid ObjectId
    const updateData = { selectedTheme };
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      updateData.updatedBy = adminId;
    }
    theme = await this.create(updateData);
  } else {
    theme.selectedTheme = selectedTheme;
    // Only set updatedBy if adminId is a valid ObjectId
    if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
      theme.updatedBy = adminId;
    }
    theme.updatedAt = Date.now();
    await theme.save();
  }
  return theme;
};

module.exports = mongoose.model('Theme', ThemeSchema);
