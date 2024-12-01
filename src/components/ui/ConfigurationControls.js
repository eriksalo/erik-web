import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ssdCapacities, hddCapacities, jbodSizes } from '../constants/pricing';

const ConfigurationControls = ({ config, onConfigChange }) => {
  const handleJbodSizeChange = (value) => {
    const newJbodSize = parseInt(value);
    let newHddSize = config.hddSize;

    if (newJbodSize === 108 && newHddSize === 18) {
      newHddSize = hddCapacities.find(size => size !== 18);
    }

    onConfigChange({ ...config, jbodSize: newJbodSize, hddSize: newHddSize });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input System Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Move all the Select components here */}
      </CardContent>
    </Card>
  );
};

export default ConfigurationControls;
