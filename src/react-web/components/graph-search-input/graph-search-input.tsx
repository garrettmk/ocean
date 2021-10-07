import { useGraphEditor } from '@/react-web/hooks';
import { Input, InputProps } from '@chakra-ui/input';
import React from 'react';
import { useDebounce } from 'react-use';


export type GraphSearchInputProps = InputProps & {

};


export function GraphSearchInput(props: GraphSearchInputProps) : JSX.Element {
  const { send } = useGraphEditor();
  const [value, setValue] = React.useState('');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValue(value);
  }, []);
  
  const [, cancel] = useDebounce(() => {
    send({ type: 'loadGraph', payload: {
      title: value ? value.split(' ') : undefined
    }});
  }, 300, [value]);

  return (
    <Input
      placeholder='Search...'
      bg='gray.300'
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}