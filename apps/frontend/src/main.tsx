import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MantineProvider } from '@mantine/core';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient.ts';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </MantineProvider>,
)
 