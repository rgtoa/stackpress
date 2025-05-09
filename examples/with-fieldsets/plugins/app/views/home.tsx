import '../styles/page.css';
import { useState } from 'react';
import { LayoutBlank, ServerPageProps } from 'stackpress/view/client';

export function Head(props: ServerPageProps) {
  const { styles = [] } = props;
  return (
    <>
      <title>Reactus</title>
      <meta name="description" content="Reactus" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="stylesheet" type="text/css" href="/styles/global.css" />
      {styles.map((href, index) => (
        <link key={index} rel="stylesheet" type="text/css" href={href} />
      ))}
    </>
  )
}

export default function HomePage(props: ServerPageProps) {
  const { session, request, response } = props;
  const [count, setCount] = useState(0)

  return (
    <LayoutBlank
      session={session}
      request={request}
      response={response}
    >
      <div className="px-p-10">
        <h1>Welcome to Stackpress</h1>
        <div className="p-4">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
        </div>
      </div>
    </LayoutBlank>
  )
}