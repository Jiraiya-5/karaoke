import { library, config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Solid
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons/faCircleInfo'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons/faTriangleExclamation'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons/faCircleXmark'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons/faCircleCheck'
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy'
import { faClose } from '@fortawesome/free-solid-svg-icons/faClose'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic'
import { faListOl } from '@fortawesome/free-solid-svg-icons/faListOl'
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle'
import { faCircleDot } from '@fortawesome/free-solid-svg-icons/faCircleDot'

// Brands
import { faGoogle } from '@fortawesome/free-brands-svg-icons/faGoogle'
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin'
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube'
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram'
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook'

config.autoAddCss = false

library.add(
  faCircleInfo,
  faTriangleExclamation,
  faCircleXmark,
  faCircleCheck,
  faCopy,
  faClose,
  faPlay,
  faMusic,
  faListOl,
  faCircle,
  faCircleDot,
  faGoogle,
  faLinkedin,
  faYoutube,
  faInstagram,
  faFacebook
)

export default FontAwesomeIcon