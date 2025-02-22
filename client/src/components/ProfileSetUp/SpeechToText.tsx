/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

const SpeechToText = ({ onTranscriptChange }: any) => {
  const [transcript, setTranscript] = React.useState('');

  const handleSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onresult = event => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onTranscriptChange(result); // Notify parent component about transcript change
    };

    recognition.start();
  };

  return (
    <div>
      <IconButton
        onClick={handleSpeechRecognition}
        color="primary"
        aria-label="Start Speech Recognition"
      >
        <MicIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default SpeechToText;
