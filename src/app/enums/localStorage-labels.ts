
enum role { 
  customSelectedList = 'customSelectedListOfROLE',
  selectedList = 'selectedListOfROLE',
  filerBody = 'filerBodyROLE',
}

enum user { 
  customSelectedList = 'customSelectedListOfUSER',
  selectedList = 'selectedListOfUSER',
  filerBody = 'filerBodyUSER',
}

enum etp { 
  customSelectedList = 'customSelectedListOfETP',
  selectedList = 'selectedListOfETP',
  filerBody = 'filerBodyETP',
}

enum pl { 
  customSelectedList = 'customSelectedListOfPL',
  selectedList = 'selectedListOfPL',
  filerBody = 'filerBodyPL',
}

export const localStorageLabels = {
  role,
  etp,
  pl,
  user,
  selectedListOfKinds: 'selectedListOfKinds',
  localCurrentLanguage: 'localCurrentLanguage',
  loading: 'loading',
}
