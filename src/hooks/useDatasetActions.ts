import { useCallback } from 'react'

import { useStore } from '../store'
import { addAgentAPI, getCollectionsAPI, getDatasetsAPI } from '@/api/os'

const useDatasetActions = () => {
  const selectedDatasetEndpoint = useStore(
    (state) => state.selectedDatasetEndpoint
  )

  const getDatasets = useCallback(async () => {
    const result = await getDatasetsAPI(selectedDatasetEndpoint)
    return result?.data
  }, [selectedDatasetEndpoint])

  const getCollections = useCallback(
    async (datasetId: string) => {
      const result = await getCollectionsAPI(selectedDatasetEndpoint, datasetId)
      return result?.data?.collections
    },
    [selectedDatasetEndpoint]
  )

  const addAgent = useCallback(
    async (postData: any) => {
      const result = await addAgentAPI(selectedDatasetEndpoint, postData)
      return result
    },
    [selectedDatasetEndpoint]
  )

  return { getDatasets, getCollections, addAgent }
}

export default useDatasetActions
