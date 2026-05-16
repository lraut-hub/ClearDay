
import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal, Box, Typography, Paper, CircularProgress, Alert, AlertTitle } from '@mui/material';

interface MobilePreviewModalProps {
  open: boolean;
  onClose: () => void;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '92%',
  maxWidth: 450,
  bgcolor: 'background.paper',
  borderRadius: 'var(--cd-radius-lg)',
  border: '1px solid var(--cd-outline)',
  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
  p: 3,
  textAlign: 'center',
  animation: 'scaleIn 300ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
};

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box component="code" sx={{ 
        bgcolor: 'var(--cd-bg-surface-highest)', 
        p: 0.5, 
        borderRadius: 'var(--cd-radius-sm)', 
        fontFamily: 'monospace', 
        fontSize: '0.85rem',
        color: 'primary.light',
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
        <Alert 
          severity="info" 
          sx={{ 
            textAlign: 'left', mt: 2,
            bgcolor: 'var(--cd-primary-container)',
            color: 'var(--cd-on-primary-container)',
            '& .MuiAlert-icon': { color: 'primary.main' },
          }}
        >
            <AlertTitle sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              Action Required
            </AlertTitle>
            <Typography variant="body2" component="div" sx={{ '& strong': { color: 'primary.light' }}}>
                Your app is running locally, which means it's likely not visible to other devices on your network by default.
                <br /><br />
                <strong>1. Expose Your Server:</strong>
                <br />
                Stop your current development server and restart it with a <CodeBlock>--host</CodeBlock> flag:
                <Box sx={{ my: 1, p: 1, bgcolor: 'var(--cd-bg-surface-highest)', borderRadius: 'var(--cd-radius-sm)'}}>
                    <CodeBlock>npm run dev -- --host</CodeBlock>
                </Box>

                <strong>2. Connect Manually:</strong>
                <br />
                Find your computer's local IP address. Then, on your phone's browser, go to:
                <Box sx={{ my: 1, p: 1, bgcolor: 'var(--cd-bg-surface-highest)', borderRadius: 'var(--cd-radius-sm)'}}>
                    <CodeBlock>http://[Your-Computer-IP]:{port}</CodeBlock>
                </Box>

                <strong>3. Check Your Firewall:</strong>
                <br />
                If it still doesn't connect, your computer's firewall might be blocking the connection on port {port}.
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
                    bgcolor: 'common.white',
                    borderRadius: 'var(--cd-radius-md)',
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
      <Box sx={modalStyle}>
        <Typography 
          id="mobile-preview-modal-title" 
          variant="h5" 
          component="h2" 
          sx={{ mb: 2, fontFamily: "'DM Sans', sans-serif" }}
        >
          Preview on Mobile
        </Typography>
        {renderContent()}
      </Box>
    </Modal>
  );
};

export default MobilePreviewModal;
