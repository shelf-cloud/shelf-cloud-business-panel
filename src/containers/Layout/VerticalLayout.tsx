import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Collapse } from 'reactstrap'
// import navdata from './LayoutMenuData'
// import navdata from './LayoutMenuDataVideo'
import navdata from './RoleBaseLayoutMenu'
import { useRouter } from 'next/router'

const VerticalLayout = () => {
  const navData = navdata().props.children
  const { pathname } = useRouter()
  const [actualCollapsed, setActualCollapsed] = useState('')
  const [actualSubItemCollapsed, setActualSubItemCollapsed] = useState('')

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
                <Link
                  href={item.link ? item.link : '/#'}
                  className={
                    'nav-link menu-link rounded-top ' + (item?.subItems?.some((subItem: any) => pathname == subItem?.link.split('?')[0] || subItem?.childItems?.some((subitemChild: any) => pathname == subitemChild.link.split('?')[0])) && 'linkActive')
                  }
                  onClick={(e) => {
                    item.click(e)
                    if (actualCollapsed == item.label) {
                      setActualCollapsed('')
                    } else {
                      setActualCollapsed(item.label)
                    }
                  }}
                  data-bs-toggle='collapse'
                  aria-expanded={actualCollapsed == item.label ? true : false}>
                  <i className={item.icon}></i>
                  <span data-key='t-apps'>{item.label}</span>
                  {item.badgeName ? (
                    <span className={'badge badge-pill bg-' + item.badgeColor} data-key='t-new'>
                      {item.badgeName}
                    </span>
                  ) : null}
                </Link>
                <Collapse className='menu-dropdown' isOpen={item.stateVariables} id='sidebarApps'>
                  <ul className='nav nav-sm flex-column test' style={{ borderLeft: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    {/* subItms  */}
                    {item?.subItems &&
                      (item?.subItems || []).map((subItem: any, key: any) => (
                        <React.Fragment key={key}>
                          {!subItem.isChildItem ? (
                            <li className='nav-item w-100'>
                              <Link
                                href={subItem.link ? subItem.link : '/#'}
                                className={'nav-link menu-link w-100 ' + ((pathname == `${subItem.link.split('?')[0]}` || subItem?.childItems?.some((subitemChild: any) => pathname == subitemChild.link.split('?')[0])) && 'subLinkActive')}>
                                {subItem.label}
                                {subItem.badgeName ? (
                                  <span className={'badge badge-pill bg-' + subItem.badgeColor} data-key='t-new'>
                                    {subItem.badgeName}
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          ) : (
                            <li className='nav-item'>
                              <Link
                                href={'/#'}
                                onClick={(e) => {
                                  subItem.click(e)
                                  if (actualSubItemCollapsed == subItem.label) {
                                    setActualSubItemCollapsed('')
                                  } else {
                                    setActualSubItemCollapsed(subItem.label)
                                  }
                                }}
                                className={'nav-link w-100 ' + ((pathname == `${subItem.link.split('?')[0]}` || subItem?.childItems?.some((subitemChild: any) => pathname == subitemChild.link.split('?')[0])) && 'linkActive')}
                                data-bs-toggle='collapse'
                                aria-expanded={actualSubItemCollapsed == subItem.label ? true : false}>
                                {subItem.label}
                              </Link>
                              <Collapse className='menu-dropdown' isOpen={subItem.stateVariables}>
                                <ul className='nav nav-sm flex-column' style={{ borderLeft: '2px solid rgba(255, 255, 255, 0.1)', paddingLeft: '0px' }} id='childrenChildslist'>
                                  {/* child subItms  */}
                                  {subItem.childItems &&
                                    (subItem.childItems || []).map((childItem: any, key: any) => (
                                      <React.Fragment key={key}>
                                        {!childItem.childItems ? (
                                          <li className='nav-item rounded'>
                                            <Link href={childItem.link ? childItem.link : '/#'} className={'nav-link menu-link w-100 ' + (pathname == `${childItem.link.split('?')[0]}` && 'subLinkActiveChildren')}>
                                              {childItem.label}
                                            </Link>
                                          </li>
                                        ) : (
                                          <li className='nav-item rounded'>
                                            <Link href={'/#'} className='nav-link w-100' onClick={childItem.click} data-bs-toggle='collapse'>
                                              {childItem.label}{' '}
                                              <span className='badge badge-pill bg-danger' data-key='t-new'>
                                                New
                                              </span>
                                            </Link>
                                            <Collapse className='menu-dropdown' isOpen={childItem.stateVariables}>
                                              <ul className='nav nav-sm flex-column'>
                                                {childItem.childItems.map((subChildItem: any, key: any) => (
                                                  <li className='nav-item rounded' key={key}>
                                                    <Link href={subChildItem.link} className='nav-link w-100' data-key='t-basic-action'>
                                                      {subChildItem.label}{' '}
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
                <Link href={item.link ? item.link : '/#'} className={'nav-link menu-link rounded ' + (pathname == '/' && 'linkActive')}>
                  <i className={item.icon}></i>
                  <span data-key='t-apps'>{item.label}</span>
                  {item.badgeName ? (
                    <span className={'badge badge-pill bg-' + item.badgeColor} data-key='t-new'>
                      {item.badgeName}
                    </span>
                  ) : null}
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
