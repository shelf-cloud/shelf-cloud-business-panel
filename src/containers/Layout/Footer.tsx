import React from 'react'

const Footer = () => {
  return (
    <React.Fragment>
      <footer className='footer'>
        <div className='mx-auto w-full px-3'>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 sm:w-6/12'>{new Date().getFullYear()} © Shelf Cloud.</div>
            <div className='px-3 sm:w-6/12'>
              <div className='sm:text-right hidden sm:block'>Design & Develop by Shelf Cloud</div>
            </div>
          </div>
        </div>
      </footer>
    </React.Fragment>
  )
}

export default Footer
