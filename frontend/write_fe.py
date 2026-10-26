import base64, os; data=open('fe_b64.txt').read(); open('src/pages/ForecastExplorer.tsx','wb').write(__import__('base64').b64decode(data)); print('done')
