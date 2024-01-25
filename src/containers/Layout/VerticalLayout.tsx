import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Collapse } from 'reactstrap'
// import navdata from './LayoutMenuData'
import navdata from './LayoutMenuDataVideo'
import { useRouter } from 'next/router'

const VerticalLayout = () => {
  const navData = navdata().props.children
  const { pathname } = useRouter()

  return (
    <React.Fragment>
      {/* menu Items */}
      {(navData || []).map((item: any, key: any) => {
        return (
          <React.Fragment key={key}>
            {/* Main Header */}
            {item['isHeader'] ? (
              <li className='menu-title'>
                <span data-key='t-menu'>{item.label}</span>
              </li>
            ) : item.subItems ? (
              <li className='nav-item'>
                <Link href={item.link ? item.link : '/#'} passHref>
                  <a
                    className={'nav-link menu-link ' + (item?.subItems?.some((item: any) => pathname == item.link.split('?')[0]) && 'linkActive')}
                    onClick={item.click}
                    data-bs-toggle='collapse'>
                    <i className={item.icon}></i>
                    <span data-key='t-apps'>{item.label}</span>
                    {item.badgeName ? (
                      <span className={'badge badge-pill bg-' + item.badgeColor} data-key='t-new'>
                        {item.badgeName}
                      </span>
                    ) : null}
                  </a>
                </Link>
                <Collapse className='menu-dropdown' isOpen={item.stateVariables} id='sidebarApps'>
                  <ul className='nav nav-sm flex-column test' style={{ borderLeft: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    {/* subItms  */}
                    {item?.subItems &&
                      (item?.subItems || []).map((subItem: any, key: any) => (
                        <React.Fragment key={key}>
                          {!subItem.isChildItem ? (
                            <li className='nav-item w-100'>
                              <Link href={subItem.link ? subItem.link : '/#'} passHref>
                                <a className={'nav-link menu-link w-auto ' + (pathname == `${subItem.link.split('?')[0]}` && 'subLinkActive')}>
                                  {subItem.label}
                                  {subItem.badgeName ? (
                                    <span className={'badge badge-pill bg-' + subItem.badgeColor} data-key='t-new'>
                                      {subItem.badgeName}
                                    </span>
                                  ) : null}
                                </a>
                              </Link>
                            </li>
                          ) : (
                            <li className='nav-item'>
                              <Link href={'/#'} passHref>
                                <a onClick={subItem.click} className='nav-link' data-bs-toggle='collapse'>
                                  {subItem.label}
                                </a>
                              </Link>
                              <Collapse className='menu-dropdown' isOpen={subItem.stateVariables}>
                                <ul className='nav nav-sm flex-column' style={{ borderLeft: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                  {/* child subItms  */}
                                  {subItem.childItems &&
                                    (subItem.childItems || []).map((childItem: any, key: any) => (
                                      <React.Fragment key={key}>
                                        {!childItem.childItems ? (
                                          <li className='nav-item'>
                                            <Link href={childItem.link ? childItem.link : '/#'} passHref>
                                              <a className={'nav-link menu-link w-auto ' + (pathname == `${childItem.link.split('?')[0]}` && 'subLinkActiveChildren')}>
                                                {childItem.label}
                                              </a>
                                            </Link>
                                          </li>
                                        ) : (
                                          <li className='nav-item'>
                                            <Link href={'/#'} passHref>
                                              <a className='nav-link' onClick={childItem.click} data-bs-toggle='collapse'>
                                                {childItem.label}{' '}
                                                <span className='badge badge-pill bg-danger' data-key='t-new'>
                                                  New
                                                </span>
                                              </a>
                                            </Link>
                                            <Collapse className='menu-dropdown' isOpen={childItem.stateVariables}>
                                              <ul className='nav nav-sm flex-column'>
                                                {childItem.childItems.map((subChildItem: any, key: any) => (
                                                  <li className='nav-item' key={key}>
                                                    <Link href={subChildItem.link} passHref>
                                                      <a className='nav-link' data-key='t-basic-action'>
                                                        {subChildItem.label}{' '}
                                                      </a>
                                                    </Link>
                                                  </li>
                                                ))}
                                              </ul>
                                            </Collapse>
                                          </li>
                                        )}
                                      </React.Fragment>
                                    ))}
                                </ul>
                              </Collapse>
                            </li>
                          )}
                        </React.Fragment>
                      ))}
                  </ul>
                </Collapse>
              </li>
            ) : (
              <li className='nav-item'>
                <Link href={item.link ? item.link : '/#'} passHref>
                  <a className={'nav-link menu-link ' + (pathname == '/' && 'linkActive')}>
                    <i className={item.icon}></i>
                    <span data-key='t-apps'>{item.label}</span>
                    {item.badgeName ? (
                      <span className={'badge badge-pill bg-' + item.badgeColor} data-key='t-new'>
                        {item.badgeName}
                      </span>
                    ) : null}
                  </a>
                </Link>
              </li>
            )}
          </React.Fragment>
        )
      })}
    </React.Fragment>
  )
}

VerticalLayout.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
}

export default VerticalLayout
