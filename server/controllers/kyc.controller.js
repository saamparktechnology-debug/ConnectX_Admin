const kycQueries = require('../queries/kyc.queries');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.submitKyc = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      aadhar_number, pan_number,
      bank_account_number, bank_ifsc, bank_name, bank_holder_name,
      upi_id, voice_note_url, voice_note_language
    } = req.body;

    if (!aadhar_number) {
      return res.status(400).json({ success: false, message: 'Aadhar number is required.' });
    }
    if (!pan_number) {
      return res.status(400).json({ success: false, message: 'PAN number is required.' });
    }
    if (!bank_account_number && !upi_id) {
      return res.status(400).json({ success: false, message: 'Bank account or UPI ID is required.' });
    }
    if (!voice_note_url) {
      return res.status(400).json({ success: false, message: 'Voice note is required for verification.' });
    }

    const kyc = await kycQueries.submitKyc(userId, {
      aadhar_number, pan_number,
      bank_account_number, bank_ifsc, bank_name, bank_holder_name,
      upi_id, voice_note_url, voice_note_language
    });

    res.json({ success: true, message: 'KYC submitted successfully. Pending admin verification.', data: kyc });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.getKycStatus = async (req, res) => {
  try {
    const kyc = await kycQueries.getKycByUserId(req.userId);
    res.json({ success: true, data: { kyc: kyc || null } });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.uploadVoiceNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'connectX/kyc/voice_notes',
      'video'
    );

    res.json({ success: true, data: { url: result.secure_url } });
  } catch (error) {
    console.error('Upload voice note error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
