import React, {Component, PropTypes} from 'react';
import ReactCrop from 'react-image-crop';
import bem from 'react-bem-classes';
import {connect} from 'react-redux';

import {toggleLoader, showAlert} from '^/actions/AppActions';
import {initForm, destroyForm, pushValue, updateValue} from '^/actions/FormActions';
import {NAVIGATION_BACKWARDS, navigateTo, navigateBack} from '^/actions/NavigationActions';
import {Screen, ContentTransitionGroup} from '^/components/layout';
import Facebook from '^/services/Facebook';
import {GENERIC_ERROR_MESSAGE, GENERIC_ERROR_TITLE} from '^/constants/Messages';

import './ResizePhoto.scss';
import ActionButton from "../../components/navigation/ActionButton";
import Title from "../../components/navigation/Title";
import TitleBar from "../../components/navigation/TitleBar";
import {updateSelf} from "../../actions/ApiActions";

function mapStateToProps(state) {
  const resizeProps = state.forms.getIn(['manage-photos', 'fields', 'resize']);
  const facebookPhotoId = resizeProps.facebookPhotoId;
  const instagramUrl = resizeProps.instagramUrl;
  const deviceUrl = resizeProps.deviceUrl;
  let photoUrl = '';
  if (facebookPhotoId) {
    photoUrl = Facebook.getImageUrl(facebookPhotoId, 'medium');
  } else if (instagramUrl) {
    photoUrl = instagramUrl;
  } else if (deviceUrl) {
    photoUrl = deviceUrl;
  }
  const screenWidth = window.screen.width * window.devicePixelRatio;
  const screenHeight = window.screen.height * window.devicePixelRatio;
  const minWidth = Math.round((375/screenWidth) * 100);
  const minHeight = Math.round((600/screenHeight) * 100);
  return {
    photoUrl: photoUrl,
    blob: resizeProps.blob,
    minWidth: minWidth,
    minHeight: minHeight,
    facebookPhotoId: resizeProps.facebookPhotoId || '',
    instagramUrl: resizeProps.instagramUrl || '',
    deviceUrl: resizeProps.deviceUrl || '',
    updateSelfBusy: state.user.get('updateSelfBusy'),
    updateSelfError: state.user.get('updateSelfError'),
  };
}

@connect(mapStateToProps, {toggleLoader, updateValue, showAlert, navigateTo, navigateBack, pushValue, updateSelf})
@bem({block: 'resize-photo-screen'})
class ResizePhoto extends Component {
  state = {
    scale: 1,
    crop: {
      width: 50,
      x: 20,
      y: 10,
    },
  }

  static contextTypes = {
    store: PropTypes.shape({
      getState: PropTypes.func,
    }),
  };

  static propTypes = {
    minWidth: PropTypes.number,
    minHeight: PropTypes.number,
    photoUrl: PropTypes.string.isRequired,
    facebookPhotoId: PropTypes.string,
    instagramUrl: PropTypes.string,
    deviceUrl: PropTypes.string,
    blob: PropTypes.object,
    updateValue: PropTypes.func.isRequired,
    showAlert: PropTypes.func.isRequired,
    navigateTo: PropTypes.func.isRequired,
    navigateBack: PropTypes.func.isRequired,
    pushValue: PropTypes.func.isRequired,
    updateSelf: PropTypes.func.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.updateSelfBusy != this.props.updateSelfBusy) {
      this.props.toggleLoader(nextProps.updateSelfBusy);
    }
    if (this.props.updateSelfBusy && !nextProps.updateSelfBusy) {
      if (nextProps.updateSelfError) {
        this.props.showAlert({title: GENERIC_ERROR_TITLE, message: GENERIC_ERROR_MESSAGE});
      } else {
        this.props.navigateTo('manage-photos');
      }
    }
  }

  onCropTap = () => {
    const params = {
      crop: this.state.crop,
    };
    if (this.props.facebookPhotoId) {
      params.facebookPhotoId = this.props.facebookPhotoId;
    } else if (this.props.instagramUrl) {
      params.instagramUrl = this.props.instagramUrl;
    } else if (this.props.deviceUrl) {
      params.deviceUrl = this.props.deviceUrl;
      params.blob = this.props.blob;
    }
    this.props.pushValue('manage-photos', 'photos', params);
    const state = this.context.store.getState();
    const photos = state.forms.getIn(['manage-photos', 'fields', 'photos']);
    const data = {photos: photos.map(photo => _.omit(photo, 'images'))};
    this.props.updateSelf(data);
  }

  onCancelTap = () => {
    this.props.navigateTo('manage-photos');
  }

  onComplete = (crop, pixelCrop) => {
    this.state.crop = pixelCrop;
  }

  onImageLoaded = (crop, image, pixelCrop) => {
    this.state.crop = pixelCrop;
  }

  render() {
    const x = this.state.crop.x;
    const y = this.state.crop.y;
    const width = this.state.crop.width;
    return (
      <Screen className={this.block()}>
        <TitleBar className={this.element('title')}>
          <ActionButton left onTap={this.onCancelTap}>Cancel</ActionButton>
          <ActionButton right onTap={this.onCropTap}>Crop</ActionButton>
          <Title>Resize photo</Title>
        </TitleBar>
        <ContentTransitionGroup>
          <Choose>
            <When condition={this.props.updateSelfBusy}>
              <span />
            </When>
            <Otherwise>
              <div className={this.element('wrapper')}>
                <ReactCrop
                  className={this.element('canvas')}
                  src={this.props.photoUrl}
                  crop={
                    {
                      width: 80,
                      height: 80,
                    }
                  }
                  minWidth={this.props.minWidth}
                  minHeight={this.props.minHeight}
                  onImageLoaded={this.onImageLoaded}
                  onComplete={this.onComplete}
                  keepSelection={true}
                />
              </div>
            </Otherwise>
            </Choose>
        </ContentTransitionGroup>
      </Screen>
    )
  };
}
;

export default ResizePhoto;
