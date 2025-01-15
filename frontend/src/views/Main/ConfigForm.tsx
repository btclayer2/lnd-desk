import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { defaultConfig, useCreateStore } from '@/store/create';

interface Config {
  [section: string]: {
    [key: string]: string;
  };
}


const parseConfig = (config: string): Config => {
  const lines = config.split('\n');
  const result: Config = {};
  let currentSection: string | null = null;

  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1);
      result[currentSection] = {};
    } else if (currentSection) {
      const [key, value] = line.split('=').map((str) => str.trim());
      result[currentSection][key] = value || '';
    }
  });

  return result;
};

const stringifyConfig = (configObj: Config): string => {
  let result = '';
  for (const [section, options] of Object.entries(configObj)) {
    result += `[${section}]\n`;
    for (const [key, value] of Object.entries(options)) {
      result += `${key}=${value}\n`;
    }
    result += '\n';
  }
  return result.trim();
};

const ConfigForm = () => {
  const { config, setConfig, aliasName, setAliasName } = useCreateStore()
  const [configObj, setConfigObj] = useState<Config>(parseConfig(defaultConfig));
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = (section: string, key: string, value: string) => {
    const updatedConfig = { ...configObj };
    updatedConfig[section][key] = value;
    setConfigObj(updatedConfig);
    setConfig(stringifyConfig(updatedConfig));
  };

  const handleBitcoinNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const network = event.target.value;
    const updatedConfig = { ...configObj };

    // Reset all Bitcoin networks to false
    Object.keys(updatedConfig['Bitcoin']).forEach((key) => {
      if (key.startsWith('bitcoin.')) {
        updatedConfig['Bitcoin'][key] = 'false';
      }
    });

    // Set selected network to true
    updatedConfig['Bitcoin'][`bitcoin.${network}`] = 'true';
    setConfigObj(updatedConfig);
    setConfig(stringifyConfig(updatedConfig));
  };

  const changeAliasName = (e: { target: { value: string; }; }) => {
    handleChange('Application Options', 'alias', e.target.value)
    setAliasName(e.target.value)
  }

  const handleBlur = () => {
    setIsTouched(true);
  };

  // @ts-ignore
  return (
    <>
      <div className="flex flex-col items-start w-full gap-[8px]">
        <div className="font-normal text-base text-black leading-5 text-left uppercase:none">Your LND Alias</div>
        {/*<Input className="w-full" id="lndDir" type="text" required placeholder={'Input your name'}  value={configObj['Application Options']['alias']}/>*/}
        <Input
          className={`w-full border ${isTouched && ! aliasName? 'border-red-500' : 'border-gray-300'} focus:border-[#E67137] focus:ring-2 focus:ring-[#E67137]`}
          id="lndDir"
          type="text"
          required
          placeholder="Input your name"
          value={aliasName}
          onChange={(e)=>changeAliasName(e)} // 更新输入值
          onBlur={handleBlur} // 失焦时触发
        />
      </div>
      <div className="flex flex-col items-start w-full gap-[8px]">
        <div className="font-normal text-base text-black leading-5 text-left uppercase:none mb-[12px]">Special node configuration</div>
        <div className="flex flex-col items-start w-full gap-[8px]">
          <div className="flex flex-row w-full">
            <div className="font-normal text-sm text-black leading-4 text-left w-[170px]">BTC Network:</div>
            <select id="bitcoin-network"
                    className="w-full flex h-9 rounded-md border border-input px-3 bg-transparent py-1 text-base outline-none"
                    value={Object.keys(configObj['Bitcoin']).find((key) =>
                      configObj['Bitcoin'][key] === 'true'
                    )?.replace('bitcoin.', '')}
                    onChange={handleBitcoinNetworkChange} >
              {['mainnet', 'testnet', 'simnet', 'regtest', 'signet'].map((network) => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-row w-full">
            <div className="font-normal text-sm text-black leading-4 text-left font-normal w-[170px]">REST cors:</div>
            <Input className="w-full" id="lndDir" type="text"  value={configObj['Application Options']['restcors']} onChange={(e) =>
              handleChange('Application Options', 'restcors', e.target.value)
            } />
          </div>
          <div className="flex flex-row w-full">
            <div className="font-normal text-sm text-black leading-4 text-left font-normal w-[170px]">RPC Listen Endpoint:</div>
            <Input className="w-full" id="lndDir" type="text"  value={configObj['Application Options']['rpclisten']} onChange={(e) =>
              handleChange('Application Options', 'rpclisten', e.target.value)
            } />
          </div>
          <div className="flex flex-row w-full">
            <div className="font-normal text-sm text-black leading-4 text-left font-normal w-[170px]">REST Listen Endpoint:</div>
            <Input className="w-full" id="lndDir" type="text" value={configObj['Application Options']['restlisten']}
                   onChange={(e) =>
                     handleChange('Application Options', 'restlisten', e.target.value)
                   } />
          </div>
        </div>
      </div>
      {/*<textarea*/}
      {/*  style={{ width: '100%', height: '200px' }}*/}
      {/*  value={config}*/}
      {/*  readOnly*/}
      {/*/>*/}
    </>
  );
};

export default ConfigForm;
