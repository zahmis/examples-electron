import { connect } from 'react-redux'
import { enumSubFolders, enumItems } from '../actions/index'
import { Folder, AppState } from '../RendererTypes'
import { Explorer, StateByProps, DispatchByProps } from '../components/Explorer'

const mapStateToProps = (state: AppState): StateByProps => ({
  folders: state.folders,
  currentFolder: state.currentFolder
})

const mapDispatchToProps = (dispatch: any): DispatchByProps => ({
  enumSubFolders: (folderPath: string) => {
    dispatch(enumSubFolders(folderPath))
  },
  enumItems: (folder: Folder) => {
    dispatch(enumItems(folder))
  }
})

export const Container = connect(mapStateToProps, mapDispatchToProps)(Explorer)
