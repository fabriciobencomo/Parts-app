import partsApi from '../../api/parts.api.json';

export const usePart = (id) => {
  
  const part = partsApi.autoParts.find((part) => {
    if(part.id == id){
      return part
    }
  })

  return part
};