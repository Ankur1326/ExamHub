import React from 'react'
import Skeleton from 'react-loading-skeleton'

function skeletonLoader() {
  return (
    <div>
      <Skeleton /> // Simple, single-line loading skeleton
      <Skeleton count={5} /> 
    </div>
  )
}

export default skeletonLoader
