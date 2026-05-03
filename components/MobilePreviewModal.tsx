
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal, Box, Typography, Paper, CircularProgress, Alert, AlertTitle } from '@mui/material';

interface MobilePreviewModalProps {
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 450, // Increased width for more detailed instructions
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
  textAlign: 'center',
};

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box component="code" sx={{ 
        bgcolor: 'action.hover', 
        p: 0.5, 
        borderRadius: 1, 
        fontFamily: 'monospace', 
        fontSize: '0.875rem' 
    }}>
        {children}
    </Box>
);

const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({ open, onClose }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [port, setPort] = useState('');

  useEffect(() => {
    if (open) {
      // Reset state on modal open
      setQrCodeUrl(null);
      setError(null);
      setIsLocalhost(false);

      const hostname = window.location.hostname;
      const currentPort = window.location.port;
      setPort(currentPort);
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsLocalhost(true);
      } else {
        const url = window.location.href;
        QRCode.toDataURL(url, { width: 256, margin: 1 })
          .then(dataUrl => {
            setQrCodeUrl(dataUrl);
          })
          .catch(err => {
            console.error('Error generating QR code:', err);
            setError('Failed to generate QR code.');
          });
      }
    }
  }, [open]);

  const renderContent = () => {
    if (isLocalhost) {
      return (
        <Alert severity="info" sx={{ textAlign: 'left', mt: 2 }}>
            <AlertTitle>Action Required to Preview on Mobile</AlertTitle>
            <Typography variant="body2" component="div" sx={{ '& strong': { color: 'info.light' }}}>
                Your app is running locally, which means it's likely not visible to other devices on your network by default.
                <br /><br />
                <strong>1. Expose Your Server:</strong>
                <br />
                Stop your current development server and restart it with a <CodeBlock>--host</CodeBlock> flag. This tells it to listen for connections from other devices. For example:
                <Box sx={{ my: 1, p: 1, bgcolor: 'action.focus', borderRadius: 1}}>
                    <CodeBlock>npm run dev -- --host</CodeBlock>
                </Box>

                <strong>2. Connect Manually:</strong>
                <br />
                Find your computer's local IP address (e.g., in Wi-Fi settings). Then, on your phone's browser, go to:
                <Box sx={{ my: 1, p: 1, bgcolor: 'action.focus', borderRadius: 1}}>
                    <CodeBlock>http://[Your-Computer-IP]:{port}</CodeBlock>
                </Box>

                <strong>3. Check Your Firewall:</strong>
                <br />
                If it still doesn't connect, your computer's firewall might be blocking the connection. You may need to allow incoming connections for the port your app is using ({port}).
            </Typography>
        </Alert>
      );
    }

    return (
        <>
            <Paper 
                variant="outlined" 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 272,
                    height: 272,
                    mx: 'auto',
                    p: 1, 
                    mb: 2, 
                    bgcolor: 'common.white' 
                }}
            >
                {!qrCodeUrl && !error && <CircularProgress />}
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR code for mobile preview" width="256" height="256" />}
                {error && <Typography variant="caption" color="error">{error}</Typography>}
            </Paper>
            <Typography variant="body2" color="text.secondary">
                Scan this QR code with your phone's camera. Make sure both devices are on the same Wi-Fi network.
            </Typography>
        </>
    )
  }

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="mobile-preview-modal-title">
      <Box sx={style}>
        <Typography id="mobile-preview-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Preview on Mobile
        </Typography>
        {renderContent()}
      </Box>
    </Modal>
  );
};

export default MobilePreviewModal;
