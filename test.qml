import QtQuick 2.15
import QtQuick.Controls 2.15
.pragma library

// Main item
Item {
id: root
    width: 200; height: 200


property int count: 0
    Rectangle {
anchors.fill: parent
color: count > 0 ? "green" : "red"

        MouseArea {
anchors.fill: parent
onClicked: {
root.count++
}
}
}

    function reset() {
count = 0
}
}
